const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const consultasController = require('../controllers/consultasController');
const acercamientosController = require('../controllers/acercamientosController');
const { authenticateCognito, requireMentorOrAdmin, requireAdmin } = require('../middleware/auth');
const { validateConsulta, validateAcercamiento, sanitizeInput } = require('../middleware/validation');

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

// ============= RUTAS DE ACERCAMIENTOS (MENTOR Y ADMIN) =============
router.get('/acercamientos', authenticateCognito, requireMentorOrAdmin, acercamientosController.listar);
router.get('/acercamientos/export', authenticateCognito, requireMentorOrAdmin, acercamientosController.exportar);
router.get('/acercamientos/:id', authenticateCognito, requireMentorOrAdmin, acercamientosController.obtener);
router.put('/acercamientos/:id', authenticateCognito, requireMentorOrAdmin, sanitizeInput, validateAcercamiento, acercamientosController.actualizar);

// Solo admins pueden eliminar acercamientos
router.delete('/acercamientos/:id', authenticateCognito, requireAdmin, acercamientosController.eliminar);

module.exports = router;



