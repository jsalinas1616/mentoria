const serverless = require('serverless-http');
const app = require('./index');

// Wrapper para AWS Lambda con configuración para pasar el contexto de API Gateway
module.exports.handler = serverless(app, {
  // Content-Types que deben tratarse como binarios (devolverlos en base64
  // para que API Gateway HTTP v2 los entregue al cliente sin corromper).
  // Sin esto, los archivos .xlsx (y otros binarios) se corrompen porque
  // serverless-http intenta serializarlos como UTF-8.
  binary: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/octet-stream',
    'application/pdf',
    'application/zip',
    'image/*',
  ],
  request: (request, event, context) => {
    // Pasar el contexto de API Gateway a Express
    request.requestContext = event.requestContext;
    request.event = event;
    request.context = context;
  },
});




