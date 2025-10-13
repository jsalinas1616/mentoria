const express = require('express');
const router = express.Router();
const consultasController = require('../controllers/consultasController');
const { authenticateToken } = require('../middleware/auth');

// Ruta pública - Crear consulta (sin autenticación)
router.post('/', consultasController.crear);

// Rutas protegidas - Requieren autenticación
router.get('/', authenticateToken, consultasController.listar);
router.get('/export', authenticateToken, consultasController.exportar);
router.get('/:id', authenticateToken, consultasController.obtener);
router.put('/:id', authenticateToken, consultasController.actualizar);
router.delete('/:id', authenticateToken, consultasController.eliminar);

module.exports = router;


