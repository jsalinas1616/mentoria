const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const consultasController = require('../controllers/consultasController');
const { authenticateToken } = require('../middleware/auth');
const { validateConsulta, sanitizeInput } = require('../middleware/validation');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas del dashboard
router.get('/stats', dashboardController.obtenerEstadisticas);

// Rutas de consultas protegidas dentro del dashboard
router.get('/consultas', consultasController.listar);
router.get('/consultas/export', consultasController.exportar);
router.get('/consultas/:id', consultasController.obtener);
router.post('/consultas', sanitizeInput, validateConsulta, consultasController.crear);
router.put('/consultas/:id', sanitizeInput, validateConsulta, consultasController.actualizar);
router.delete('/consultas/:id', consultasController.eliminar);

module.exports = router;




