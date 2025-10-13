const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const consultasRoutes = require('./consultasRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Montar rutas
router.use('/auth', authRoutes);
router.use('/consultas', consultasRoutes);
router.use('/dashboard', dashboardRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Nadro Mentoría API funcionando correctamente' });
});

module.exports = router;


