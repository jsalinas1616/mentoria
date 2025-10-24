const serverless = require('serverless-http');
const app = require('./index');

// Wrapper para AWS Lambda con configuración para pasar el contexto de API Gateway
module.exports.handler = serverless(app, {
  request: (request, event, context) => {
    // Pasar el contexto de API Gateway a Express
    request.requestContext = event.requestContext;
    request.event = event;
    request.context = context;
  }
});




