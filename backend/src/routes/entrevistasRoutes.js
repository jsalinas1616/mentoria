const express = require('express');
const router = express.Router();
const entrevistasController = require('../controllers/entrevistasController');
const { authenticateCognito, requireMentorOrAdmin, requireAdmin } = require('../middleware/auth');
const { validateEntrevista, sanitizeInput } = require('../middleware/validation');

// TODAS las rutas requieren autenticación con Cognito
// Mentores y Admins pueden crear y gestionar entrevistas
router.post('/', authenticateCognito, requireMentorOrAdmin, sanitizeInput, validateEntrevista, entrevistasController.crear);
router.get('/', authenticateCognito, requireMentorOrAdmin, entrevistasController.listar);
router.get('/export', authenticateCognito, requireMentorOrAdmin, entrevistasController.exportar);
router.get('/:id', authenticateCognito, requireMentorOrAdmin, entrevistasController.obtener);
router.put('/:id', authenticateCognito, requireMentorOrAdmin, sanitizeInput, validateEntrevista, entrevistasController.actualizar);

// Solo admins pueden eliminar
router.delete('/:id', authenticateCognito, requireAdmin, entrevistasController.eliminar);

module.exports = router;


