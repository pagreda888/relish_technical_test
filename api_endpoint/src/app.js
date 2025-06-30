const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// test route - first response type var response
app.get("/", (request, response) => {
  const status = {
    Status: "Running",
  };

  response.send(status);
});

// test api endpoint - second response type json alternative
app.get("/api/test", (request, response) => {
  response.json({
    message: "Demo endpoint",
    timestamp: new Date().toISOString(),
  });
});

// external API users fetch test with axios
app.get("/externalapi/users", (request, response) => {
  const API_URL = process.env.API_URL;
  axios
    .get(`${API_URL}/users/`)
    .then((apiResponse) => {
      response.json(apiResponse.data);
    })
    .catch((error) => {
      console.error("Error fetching data from external API:", error);
      response
        .status(500)
        .json({ error: "Failed to fetch data from external API" });
    });
});

// external API users fetch an specific response value, we nedd to retreive ids's
// for a cleaner aproach we can use async and wait
app.get("/externalapi/photos/:id", async (request, response) => {
  try {
    const API_URL = process.env.API_URL;
    const photo_id = request.params.id;
    const apiResponse = await axios.get(`${API_URL}/photos/${photo_id}`);
    response.json({
      id: apiResponse.data.id,
      title: apiResponse.data.title,
    });
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    response
      .status(500)
      .json({ error: "Failed to fetch data from external API" });
  }
});

module.exports = app;
