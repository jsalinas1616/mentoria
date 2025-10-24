const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticar con Cognito JWT
 * El token JWT ya fue validado por API Gateway Authorizer
 */
const authenticateCognito = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token de autenticación requerido' });
    }

    // Decodificar el token (ya fue validado por API Gateway)
    const decoded = jwt.decode(token);
    
    if (!decoded) {
      return res.status(403).json({ message: 'Token inválido' });
    }

    // Extraer información del usuario del token de Cognito
    const userInfo = {
      id: decoded.sub, // Cognito user ID
      email: decoded.email,
      username: decoded['cognito:username'],
      groups: decoded['cognito:groups'] || [], // Roles del usuario
      tokenUse: decoded.token_use,
    };

    // Agregar al request
    req.user = userInfo;
    req.cognitoToken = decoded;

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(403).json({ message: 'Error al autenticar' });
  }
};

/**
 * Middleware para verificar roles específicos
 * Usar después de authenticateCognito
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.groups) {
      return res.status(403).json({ message: 'Acceso denegado: sin permisos' });
    }

    const userRoles = req.user.groups;
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({ 
        message: 'Acceso denegado: permisos insuficientes',
        requiredRoles: allowedRoles,
        userRoles: userRoles,
      });
    }

    next();
  };
};

/**
 * Verificar si el usuario es admin
 * Admin: Acceso completo al dashboard y gestión de usuarios
 */
const requireAdmin = requireRole('admin');

/**
 * Verificar si el usuario es mentor o admin
 * Mentor: Solo acceso a consultas
 * Admin: Acceso completo
 */
const requireMentorOrAdmin = requireRole('admin', 'mentor');

module.exports = {
  authenticateCognito,
  requireRole,
  requireAdmin,
  requireMentorOrAdmin,
};



