// Cargar variables de entorno primero
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const { PORT } = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { sanitizeInput } = require('./middleware/validation');

const app = express();

// Configurar Helmet para headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por ventana
  message: {
    error: true,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por IP por ventana
  message: {
    error: true,
    message: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging seguro (usa console.log en Lambda, que va a CloudWatch)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  
  // Log seguro sin información sensible
  const logData = {
    timestamp,
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent') || 'unknown',
    ip: req.ip || req.connection.remoteAddress || 'unknown'
  };
  
  // No logear rutas de autenticación para evitar exposición de credenciales
  if (!req.path.includes('/auth/login') && !req.path.includes('/auth/registrar')) {
    console.log(JSON.stringify(logData));
  } else {
    // Para rutas de auth, solo logear método y timestamp
    console.log(JSON.stringify({
      timestamp,
      method: req.method,
      path: '[AUTH_ROUTE]'
    }));
  }
  
  next();
});

// Sanitización global de entrada
app.use(sanitizeInput);

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

