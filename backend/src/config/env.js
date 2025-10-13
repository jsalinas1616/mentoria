// Configuración de variables de entorno
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'nadro-mentoria-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const CONSULTAS_TABLE = process.env.CONSULTAS_TABLE || 'NadroMentoria-Consultas';
const USUARIOS_TABLE = process.env.USUARIOS_TABLE || 'NadroMentoria-Usuarios';

module.exports = {
  PORT,
  NODE_ENV,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  CONSULTAS_TABLE,
  USUARIOS_TABLE
};
