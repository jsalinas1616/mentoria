const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const consultasRoutes = require('./consultasRoutes');
const dashboardRoutes = require('./dashboardRoutes');

console.log('✅ Routes module loaded');

// Health check público (para monitoreo y verificación del API)
router.get('/health', (req, res) => {
  console.log('✅ Health check called');
  res.json({ 
    status: 'OK', 
    message: 'Nadro Mentoría API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Rutas de autenticación y gestión de usuarios (Cognito)
router.use('/auth', authRoutes);
console.log('✅ Auth routes mounted on /auth');

// Rutas de consultas (PROTEGIDAS - requieren autenticación)
router.use('/consultas', consultasRoutes);
console.log('✅ Consultas routes mounted on /consultas');

// Rutas del dashboard (PROTEGIDAS - requieren autenticación)
router.use('/dashboard', dashboardRoutes);
console.log('✅ Dashboard routes mounted on /dashboard');

module.exports = router;




