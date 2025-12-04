const { body, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      message: 'Datos de entrada inválidos',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Validaciones para autenticación
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('El email no puede exceder 255 caracteres'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('La contraseña debe tener entre 6 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
  handleValidationErrors
];

const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('El email no puede exceder 255 caracteres'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'),
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  handleValidationErrors
];

// Validaciones para consultas
const validateConsulta = [
  // Validar array de mentores
  body('mentores')
    .isArray({ min: 1 })
    .withMessage('Debe agregar al menos un mentor'),
  body('mentores.*')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre del mentor debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre del mentor solo puede contener letras y espacios'),
  body('fecha')
    .isISO8601()
    .withMessage('La fecha debe ser válida')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
      if (fecha > hoy) {
        throw new Error('La fecha no puede ser futura');
      }
      return true;
    }),
  body('sexo')
    .trim()
    .isIn(['Hombre', 'Mujer', 'Diversidad'])
    .withMessage('El sexo debe ser Hombre, Mujer o Diversidad'),
  body('lugarTrabajo')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El lugar de trabajo debe tener entre 2 y 100 caracteres'),
  body('area')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El área debe tener entre 2 y 100 caracteres'),
  body('lugarConsulta')
    .trim()
    .isIn(['Lugar de trabajo', 'Hospital', 'Funeraria', 'Domicilio', 'Llamada', 'Videollamada', 'Almacén', 'Patio de maniobras', 'Oficina', 'Otro'])
    .withMessage('El lugar de consulta debe ser una opción válida'),
  body('motivosConsulta')
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos un motivo de consulta'),
  body('motivosConsulta.*')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Cada motivo debe tener entre 2 y 200 caracteres'),
  body('observaciones')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las observaciones no pueden exceder 1000 caracteres'),
  handleValidationErrors
];

// Validaciones para capacitaciones
const validateCapacitacion = [
  body('capacitadores')
    .isArray({ min: 1 })
    .withMessage('Debe agregar al menos un capacitador'),
  body('capacitadores.*')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre del capacitador debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre del capacitador solo puede contener letras y espacios'),
  body('tema')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('El tema debe tener entre 2 y 200 caracteres'),
  body('fecha')
    .isISO8601()
    .withMessage('La fecha debe ser válida')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
      if (fecha > hoy) {
        throw new Error('La fecha no puede ser futura');
      }
      return true;
    }),
  body('hora')
    .trim()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora debe tener el formato HH:MM'),
  body('duracion')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('La duración debe tener entre 1 y 100 caracteres'),
  body('lugar')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('El lugar debe tener entre 2 y 200 caracteres'),
  body('numeroPersonasInvitadas')
    .isInt({ min: 1, max: 10000 })
    .withMessage('El número de personas invitadas debe ser un número válido mayor a 0'),
  body('numeroMentoriasAgendadas')
    .isInt({ min: 0, max: 10000 })
    .withMessage('El número de mentorías agendadas debe ser un número entero positivo o cero'),
  body('asistentes')
    .isArray()
    .withMessage('Los asistentes deben ser un array'),
  body('asistentes.*.rangoEdad')
    .trim()
    .isIn(['18-25', '26-35', '36-45', '46-55', '56+'])
    .withMessage('El rango de edad debe ser válido'),
  body('asistentes.*.sexo')
    .trim()
    .isIn(['Masculino', 'Femenino', 'Diversidad'])
    .withMessage('El sexo debe ser Masculino, Femenino o Diversidad'),
  body('asistentes.*.lugarTrabajo')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El lugar de trabajo debe tener entre 2 y 100 caracteres'),
  body('asistentes.*.area')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El área debe tener entre 2 y 100 caracteres'),
  body('observaciones')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las observaciones no pueden exceder 1000 caracteres'),
  handleValidationErrors
];

// Validaciones para entrevistas
const validateEntrevista = [
  // Validar array de entrevistadores
  body('entrevistadores')
    .isArray({ min: 1 })
    .withMessage('Debe agregar al menos un entrevistador'),
  body('entrevistadores.*')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre del entrevistador debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre del entrevistador solo puede contener letras y espacios'),
  body('fecha')
    .isISO8601()
    .withMessage('La fecha debe ser válida')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
      if (fecha > hoy) {
        throw new Error('La fecha no puede ser futura');
      }
      return true;
    }),
  body('sexo')
    .trim()
    .isIn(['Hombre', 'Mujer', 'Diversidad'])
    .withMessage('El sexo debe ser Hombre, Mujer o Diversidad'),
  body('lugarTrabajo')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El lugar de trabajo debe tener entre 2 y 100 caracteres'),
  body('area')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El área debe tener entre 2 y 100 caracteres'),
  body('lugarEntrevista')
    .trim()
    .isIn(['Lugar de trabajo', 'Hospital', 'Funeraria', 'Domicilio', 'Llamada', 'Videollamada', 'Almacén', 'Patio de maniobras', 'Oficina', 'Otro'])
    .withMessage('El lugar de entrevista debe ser una opción válida'),
  body('motivosEntrevista')
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos un motivo de entrevista'),
  body('motivosEntrevista.*')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Cada motivo debe tener entre 2 y 200 caracteres'),
  body('observaciones')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las observaciones no pueden exceder 1000 caracteres'),
  handleValidationErrors
];

// Sanitización general para prevenir XSS
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    } else if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

module.exports = {
  validateLogin,
  validateRegister,
  validateConsulta,
  validateCapacitacion,
  validateEntrevista,
  sanitizeInput,
  handleValidationErrors
};
