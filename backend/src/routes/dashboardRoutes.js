const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const consultasController = require('../controllers/consultasController');
const { authenticateCognito, requireMentorOrAdmin, requireAdmin } = require('../middleware/auth');
const { validateConsulta, sanitizeInput } = require('../middleware/validation');

// ============= RUTAS DEL DASHBOARD (SOLO ADMIN) =============
// Stats y métricas del dashboard - Solo administradores
router.get('/stats', authenticateCognito, requireAdmin, dashboardController.obtenerEstadisticas);

// ============= RUTAS DE CONSULTAS (MENTOR Y ADMIN) =============
// Mentor: Puede ver y gestionar consultas
// Admin: Acceso completo incluyendo eliminar
router.get('/consultas', authenticateCognito, requireMentorOrAdmin, consultasController.listar);
router.get('/consultas/export', authenticateCognito, requireMentorOrAdmin, consultasController.exportar);
router.get('/consultas/:id', authenticateCognito, requireMentorOrAdmin, consultasController.obtener);
router.post('/consultas', authenticateCognito, requireMentorOrAdmin, sanitizeInput, validateConsulta, consultasController.crear);
router.put('/consultas/:id', authenticateCognito, requireMentorOrAdmin, sanitizeInput, validateConsulta, consultasController.actualizar);

// Solo admins pueden eliminar consultas
router.delete('/consultas/:id', authenticateCognito, requireAdmin, consultasController.eliminar);

module.exports = router;




