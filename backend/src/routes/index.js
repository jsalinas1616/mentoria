const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const consultasRoutes = require('./consultasRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const capacitacionesRoutes = require('./capacitacionesRoutes');
const entrevistasRoutes = require('./entrevistasRoutes');
const acercamientosRoutes = require('./acercamientosRoutes');
const visitasRoutes = require('./visitasRoutes');

// Health check público (para monitoreo y verificación del API)
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Nadro Mentoría API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Rutas de autenticación y gestión de usuarios (Cognito)
router.use('/auth', authRoutes);

// Rutas de consultas (PROTEGIDAS - requieren autenticación)
router.use('/consultas', consultasRoutes);

// Rutas del dashboard (PROTEGIDAS - requieren autenticación)
router.use('/dashboard', dashboardRoutes);

// Rutas de capacitaciones (PROTEGIDAS - requieren autenticación)
router.use('/capacitaciones', capacitacionesRoutes);

// Rutas de entrevistas (PROTEGIDAS - requieren autenticación)
router.use('/entrevistas', entrevistasRoutes);

// Rutas de acercamientos (PROTEGIDAS - requieren autenticación)
router.use('/acercamientos', acercamientosRoutes);

// Rutas de visitas (PROTEGIDAS - requieren autenticación)
router.use('/visitas', visitasRoutes);

module.exports = router;




