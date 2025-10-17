const express = require('express');
const router = express.Router();
const consultasController = require('../controllers/consultasController');
const { authenticateToken } = require('../middleware/auth');
const { validateConsulta, sanitizeInput } = require('../middleware/validation');

// Ruta pública - Crear consulta (sin autenticación) con validación
router.post('/', sanitizeInput, validateConsulta, consultasController.crear);

// Rutas protegidas - Requieren autenticación
router.get('/', authenticateToken, consultasController.listar);
router.get('/export', authenticateToken, consultasController.exportar);
router.get('/:id', authenticateToken, consultasController.obtener);
router.put('/:id', authenticateToken, sanitizeInput, validateConsulta, consultasController.actualizar);
router.delete('/:id', authenticateToken, consultasController.eliminar);

module.exports = router;


