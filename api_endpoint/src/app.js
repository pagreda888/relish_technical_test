const express = require("express");
const router = express.Router();
const axios = require("axios");

const app = express();
app.use(express.json());

// test route
app.get('/', (req, res) => {
    res.json({ message: 'API works correctly' });
});

// test api endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Demo endpoint', timestamp: new Date().toISOString() });
});

module.exports = app;