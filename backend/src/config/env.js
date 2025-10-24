// Configuración de variables de entorno
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Variables de Cognito
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;

// Validar variables críticas solo en producción
if (NODE_ENV === 'production') {
  if (!COGNITO_USER_POOL_ID) {
    console.warn('⚠️  COGNITO_USER_POOL_ID no está configurado');
  }
  if (!COGNITO_CLIENT_ID) {
    console.warn('⚠️  COGNITO_CLIENT_ID no está configurado');
  }
}

// DynamoDB
const CONSULTAS_TABLE = process.env.CONSULTAS_TABLE || 'NadroMentoria-Consultas';
const USUARIOS_TABLE = process.env.USUARIOS_TABLE || 'NadroMentoria-Usuarios';

module.exports = {
  PORT,
  NODE_ENV,
  COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID,
  CONSULTAS_TABLE,
  USUARIOS_TABLE
};
