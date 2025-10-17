const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateLogin, validateRegister, sanitizeInput } = require('../middleware/validation');

// Rate limiting estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP por ventana
  message: {
    error: true,
    message: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rutas públicas con rate limiting y validación
router.post('/registrar', authLimiter, sanitizeInput, validateRegister, authController.registrar);
router.post('/login', authLimiter, sanitizeInput, validateLogin, authController.login);

// Rutas protegidas
router.get('/me', authenticateToken, authController.obtenerUsuario);

module.exports = router;



