const express = require("express");
const router = express.Router();
const axios = require("axios");

const app = express();
app.use(express.json());

// test route - first response type var response
app.get('/', (request, response) => {
     const status = {
      "Status": "Running"
   };
   
   response.send(status);
});


// test api endpoint - second response type json alternative
app.get('/api/test', (request, response) => {
    response.json({ message: 'Demo endpoint', timestamp: new Date().toISOString() });
});

// external API fetch test with axios
app.get('/externalapi/users', (request, response) => {
    axios
        .get('https://jsonplaceholder.typicode.com/users')
        .then(apiResponse => {
            response.json(apiResponse.data);
        })
        .catch(error => {
            console.error('Error fetching data from external API:', error);
            response.status(500).json({ error: 'Failed to fetch data from external API' });
        });
});

module.exports = app;