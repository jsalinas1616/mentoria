const serverless = require('serverless-http');
const app = require('./index');

// Wrapper para AWS Lambda
module.exports.handler = serverless(app);



