const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateCognito, requireAdmin } = require('../middleware/auth');

// ============= RUTAS PROTEGIDAS CON COGNITO =============
// Obtener información del usuario autenticado
router.get('/me', authenticateCognito, authController.obtenerUsuario);

// ============= RUTAS DE ADMINISTRACIÓN (SOLO ADMIN) =============
// Gestión de usuarios
router.get('/usuarios', authenticateCognito, requireAdmin, authController.listarUsuarios);
router.post('/usuarios', authenticateCognito, requireAdmin, authController.crearUsuario);
router.put('/usuarios/:email/rol', authenticateCognito, requireAdmin, authController.cambiarRol);
router.put('/usuarios/:email/password', authenticateCognito, requireAdmin, authController.cambiarPassword);
router.put('/usuarios/:email/deshabilitar', authenticateCognito, requireAdmin, authController.deshabilitarUsuario);
router.put('/usuarios/:email/habilitar', authenticateCognito, requireAdmin, authController.habilitarUsuario);

module.exports = router;



