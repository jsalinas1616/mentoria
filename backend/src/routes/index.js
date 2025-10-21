const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const consultasRoutes = require('./consultasRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Montar rutas
router.use('/auth', authRoutes);
// Mantener ruta pública para formulario sin login
router.use('/consultas', consultasRoutes);
// Rutas protegidas del dashboard (incluye consultas protegidas)
router.use('/dashboard', dashboardRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Nadro Mentoría API funcionando correctamente' });
});

module.exports = router;




