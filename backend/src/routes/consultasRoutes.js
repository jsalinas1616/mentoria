const express = require('express');
const router = express.Router();
const consultasController = require('../controllers/consultasController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// CRUD de consultas
router.post('/', consultasController.crear);
router.get('/', consultasController.listar);
router.get('/export', consultasController.exportar);
router.get('/:id', consultasController.obtener);
router.put('/:id', consultasController.actualizar);
router.delete('/:id', consultasController.eliminar);

module.exports = router;


