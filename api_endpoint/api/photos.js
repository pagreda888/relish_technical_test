const axios = require("axios");

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

module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const API_URL = process.env.API_URL || 'https://jsonplaceholder.typicode.com';
    const { url } = req;
    
    // Extract photo_id from URL if it's a single photo request
    const photoIdMatch = url.match(/\/externalapi\/photos\/(\d+)/);
    
    if (photoIdMatch) {
      // Single photo request - Task 1.1
      const photo_id = photoIdMatch[1];
      const { photos, albumMap, userMap } = await collectData(API_URL);

      // validating the photo_id
      const photoIdInt = parseInt(photo_id, 10);
      const photoData = photos.find((p) => p.id === photoIdInt);
      if (!photoData) {
        return res.status(404).json({ error: "Photo not found" });
      }

      // gathering all data related to the photo
      const enriched = gatherAllData(photoData, albumMap, userMap);
      return res.json(enriched);
    } else {
      // All photos request - Task 1.2
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
      } = req.query;

      //filter by name or title of the photo
      if (title) {
        enrichedPhotos = enrichedPhotos.filter((p) => p.title.includes(title));
      }
      // filter by album name or title
      if (albumTitle) {
        enrichedPhotos = enrichedPhotos.filter((p) =>
          p.album?.title.includes(albumTitle)
        );
      }
      // filter by user email
      if (userEmail) {
        enrichedPhotos = enrichedPhotos.filter(
          (p) => p.album?.user?.email === userEmail
        );
      }

      // pagination(using the slice function to create subarrays of the whole data)
      const paginated = enrichedPhotos.slice(
        parseInt(offset),
        parseInt(offset) + parseInt(limit)
      );

      // response with the data
      return res.json({
        total: enrichedPhotos.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        data: paginated,
      });
    }
  } catch (error) {
    console.error("Error processing request:", error.message);
    res.status(500).json({ error: "Error processing request" });
  }
};
