const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { PORT } = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware CORS configurado para S3
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://nadro-mentoria-frontend-1760378806.s3.us-east-1.amazonaws.com',
    'http://nadro-mentoria-frontend-1760378806.s3-website-us-east-1.amazonaws.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging (usa console.log en Lambda, que va a CloudWatch)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a Nadro Mentoría API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      consultas: '/api/consultas',
      dashboard: '/api/dashboard',
    },
  });
});

// Manejo de errores
app.use(errorHandler);

// Iniciar servidor solo en modo local (no en Lambda)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  });
}

module.exports = app;

