const app = require('../api_endpoint/app');
const serverless = require('serverless-http');

module.exports = serverless(app);
