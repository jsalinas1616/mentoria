const express = require('express');
const router = express.Router();
const visitasController = require('../controllers/visitasController');
const { authenticateCognito, requireMentorOrAdmin, requireAdmin } = require('../middleware/auth');
const { validateVisita, sanitizeInput } = require('../middleware/validation');

// TODAS las rutas requieren autenticación con Cognito
// Mentores y Admins pueden crear y gestionar visitas
router.post('/', authenticateCognito, requireMentorOrAdmin, sanitizeInput, validateVisita, visitasController.crear);
router.get('/', authenticateCognito, requireMentorOrAdmin, visitasController.listar);
router.get('/export', authenticateCognito, requireMentorOrAdmin, visitasController.exportar);
router.get('/:id', authenticateCognito, requireMentorOrAdmin, visitasController.obtener);
router.put('/:id', authenticateCognito, requireMentorOrAdmin, sanitizeInput, validateVisita, visitasController.actualizar);

// Solo admins pueden eliminar
router.delete('/:id', authenticateCognito, requireAdmin, visitasController.eliminar);

module.exports = router;
