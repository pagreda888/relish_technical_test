const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());
// Middleware for CORS y preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// external API fetch, here we retreive all data, and its mapped for a better ID lookup
// before, each get to the 3 endpoints was individual, now we use Promise.all to fetch all data at once, in parallel
// separated functions for a better code structure
async function collectData(API_URL) {
  const [userRes, albumRes, photoRes] = await Promise.all([
    axios.get(`${API_URL}/users`),
    axios.get(`${API_URL}/albums`),
    axios.get(`${API_URL}/photos`),
  ]);

  const users = userRes.data;
  const albums = albumRes.data;
  const photos = photoRes.data;

  const userMap = new Map(users.map((userData) => [userData.id, userData]));
  const albumMap = new Map(
    albums.map((albumData) => [albumData.id, albumData])
  );

  return { photos, albumMap, userMap };
}

// this function also estructures a json response from the data retreived in collectData
// function merges photo data with its album and user related to it
function gatherAllData(photoData, albumMap, userMap) {
  const albumData = albumMap.get(photoData.albumId);
  const userData = userMap.get(albumData.userId);

  return {
    id: photoData.id,
    title: photoData.title,
    url: photoData.url,
    thumbnailUrl: photoData.thumbnailUrl,
    album: {
      id: albumData.id,
      title: albumData.title,
      user: {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        address: {
          street: userData.address.street,
          suite: userData.address.suite,
          city: userData.address.city,
          zipcode: userData.address.zipcode,
          geo: {
            lat: userData.address.geo.lat,
            lng: userData.address.geo.lng,
          },
        },
        phone: userData.phone,
        website: userData.website,
        company: {
          name: userData.company.name,
          catchPhrase: userData.company.catchPhrase,
          bs: userData.company.bs,
        },
      },
    },
  };
}

// this function is the Task 1.1, looking one photo by ID, enriching the data
app.get("/externalapi/photos/:photo_id", async (request, response) => {
  try {
    const API_URL = process.env.API_URL;
    if (!API_URL)
      return response
        .status(500)
        .json({ error: "API_URL not defined in environment" });

    //data collection, photos, albums and users
    const { photo_id } = request.params;
    const { photos, albumMap, userMap } = await collectData(API_URL);

    // validating the photo_id
    const photoIdInt = parseInt(photo_id, 10);
    const photoData = photos.find((p) => p.id === photoIdInt);
    if (!photoData)
      return response.status(404).json({ error: "Photo not found" });

    // gathering all data related to the photo
    const enriched = gatherAllData(photoData, albumMap, userMap);
    return response.json(enriched);
  } catch (error) {
    console.error("Error processing request:", error.message);
    response.status(500).json({ error: "Error processing request" });
  }
});

// this function retreives all the data in once
app.get("/externalapi/photos", async (request, response) => {
  try {
    const API_URL = process.env.API_URL;
    if (!API_URL)
      return response
        .status(500)
        .json({ error: "API_URL not defined in environment" });

    //data collection, photos, albums and users
    const { photos, albumMap, userMap } = await collectData(API_URL);

    // gathering all data related to the photo
    let enrichedPhotos = await Promise.all(
      photos.map((photoData) => gatherAllData(photoData, albumMap, userMap))
    );

    // code section for filter the search
    const {
      title,
      "album.title": albumTitle,
      "album.user.email": userEmail,
      limit = 25,
      offset = 0,
    } = request.query;

    // filter by name or title of the photo
    if (title) {
      const lowerTitle = title.toLowerCase();
      enrichedPhotos = enrichedPhotos.filter((p) =>
        p.title.toLowerCase().includes(lowerTitle)
      );
    }

    // filter by album name or title
    if (albumTitle) {
      const lowerAlbum = albumTitle.toLowerCase();
      enrichedPhotos = enrichedPhotos.filter((p) =>
        p.album?.title.toLowerCase().includes(lowerAlbum)
      );
    }

    // filter by user email
    if (userEmail) {
      const lowerEmail = userEmail.toLowerCase();
      enrichedPhotos = enrichedPhotos.filter(
        (p) => p.album?.user?.email.toLowerCase() === lowerEmail
      );
    }

    // total después de filtrar pero antes de paginar
    const totalFiltered = enrichedPhotos.length;

    // paginación
    const paginated = enrichedPhotos.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    // response con el total correcto
    response.json({
      total: enrichedPhotos.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: paginated,
    });
    
  } catch (error) {
    console.error("Error processing request:", error.message);
    response.status(500).json({ error: "Error processing request" });
  }
});

module.exports = app;
