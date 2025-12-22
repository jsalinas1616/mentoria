const express = require('express');
const router = express.Router();
const acercamientosController = require('../controllers/acercamientosController');
const { authenticateCognito, requireMentorOrAdmin, requireAdmin } = require('../middleware/auth');
const { validateAcercamiento, sanitizeInput } = require('../middleware/validation');

// TODAS las rutas requieren autenticación con Cognito
// Mentores y Admins pueden crear y gestionar acercamientos
router.post('/', authenticateCognito, requireMentorOrAdmin, sanitizeInput, validateAcercamiento, acercamientosController.crear);
router.get('/', authenticateCognito, requireMentorOrAdmin, acercamientosController.listar);
router.get('/export', authenticateCognito, requireMentorOrAdmin, acercamientosController.exportar);
router.get('/:id', authenticateCognito, requireMentorOrAdmin, acercamientosController.obtener);
router.put('/:id', authenticateCognito, requireMentorOrAdmin, sanitizeInput, validateAcercamiento, acercamientosController.actualizar);

// Solo admins pueden eliminar
router.delete('/:id', authenticateCognito, requireAdmin, acercamientosController.eliminar);

module.exports = router;
