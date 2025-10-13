const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Rutas públicas
router.post('/registrar', authController.registrar);
router.post('/login', authController.login);

// Rutas protegidas
router.get('/me', authenticateToken, authController.obtenerUsuario);

module.exports = router;


