const express = require('express');
const router = express.Router();
const capacitacionesController = require('../controllers/capacitacionesController');
const { authenticateCognito, requireMentorOrAdmin, requireAdmin } = require('../middleware/auth');
const { validateCapacitacion, sanitizeInput } = require('../middleware/validation');

// TODAS las rutas requieren autenticación con Cognito
// Mentores y Admins pueden crear y gestionar capacitaciones
router.post('/', authenticateCognito, requireMentorOrAdmin, sanitizeInput, validateCapacitacion, capacitacionesController.crear);
router.get('/', authenticateCognito, requireMentorOrAdmin, capacitacionesController.listar);
router.get('/export', authenticateCognito, requireMentorOrAdmin, capacitacionesController.exportar);
router.get('/:id', authenticateCognito, requireMentorOrAdmin, capacitacionesController.obtener);
router.put('/:id', authenticateCognito, requireMentorOrAdmin, sanitizeInput, validateCapacitacion, capacitacionesController.actualizar);

// Solo admins pueden eliminar
router.delete('/:id', authenticateCognito, requireAdmin, capacitacionesController.eliminar);

module.exports = router;

