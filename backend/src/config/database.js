const AWS = require('aws-sdk');

// Configuración de AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLES = {
  CONSULTAS: process.env.CONSULTAS_TABLE || 'NadroMentoria-Consultas',
  ENTREVISTAS: process.env.ENTREVISTAS_TABLE || 'NadroMentoria-Entrevistas',
  USUARIOS: process.env.USUARIOS_TABLE || 'NadroMentoria-Usuarios',
  CAPACITACIONES: process.env.CAPACITACIONES_TABLE || 'NadroMentoria-Capacitaciones',
};

module.exports = {
  dynamodb,
  TABLES,
};


