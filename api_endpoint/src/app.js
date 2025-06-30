const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// external API users fetch an specific response value, we nedd to retreive ids's
// for a cleaner aproach we can use async and wait
app.get("/externalapi/photos/:id", async (request, response) => {
  try {
    const API_URL = process.env.API_URL;
    const photo_id = request.params.id;

    // fetching the photo from the external API
    const photoResponse = await axios.get(`${API_URL}/photos/${photo_id}`);
    const photoData = photoResponse.data;

    // fetching the album using the albumId from the photo
    const albumResponse = await axios.get(`${API_URL}/albums/${photoData.albumId}`);
    const albumData = albumResponse.data;

    // fetching the user information using the userId from the album data
    const userResponse = await axios.get(`${API_URL}/users/${albumData.userId}`);
    const userData = userResponse.data;

    // we have to structure the response as the same format in the test instructions
    response.json({
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
              lng: userData.address.geo.lng
            }
          },
          phone: userData.phone,
          website: userData.website,
          company: {
            name: userData.company.name,
            catchPhrase: userData.company.catchPhrase,
            bs: userData.company.bs
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    response
      .status(500)
      .json({ error: "Failed to fetch data from external API" });
  }
});

module.exports = app;
