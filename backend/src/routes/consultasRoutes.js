const express = require('express');
const router = express.Router();
const consultasController = require('../controllers/consultasController');
const { authenticateCognito, requireMentorOrAdmin, requireAdmin } = require('../middleware/auth');
const { validateConsulta, sanitizeInput } = require('../middleware/validation');

// TODAS las rutas requieren autenticación con Cognito
// Mentores y Admins pueden crear y gestionar consultas
router.post('/', authenticateCognito, requireMentorOrAdmin, sanitizeInput, validateConsulta, consultasController.crear);
router.get('/', authenticateCognito, requireMentorOrAdmin, consultasController.listar);
router.get('/export', authenticateCognito, requireMentorOrAdmin, consultasController.exportar);
router.get('/:id', authenticateCognito, requireMentorOrAdmin, consultasController.obtener);
router.put('/:id', authenticateCognito, requireMentorOrAdmin, sanitizeInput, validateConsulta, consultasController.actualizar);

// Solo admins pueden eliminar
router.delete('/:id', authenticateCognito, requireAdmin, consultasController.eliminar);

module.exports = router;


