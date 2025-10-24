const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticar con Cognito JWT
 * El token JWT ya fue validado por API Gateway Authorizer
 * La información del usuario viene en el contexto de API Gateway
 */
const authenticateCognito = async (req, res, next) => {
  try {
    // Obtener el token del header
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

    // Extraer grupos - pueden venir como array o string JSON
    let groups = [];
    const cognitoGroups = decoded['cognito:groups'];
    
    if (cognitoGroups) {
      if (Array.isArray(cognitoGroups)) {
        groups = cognitoGroups;
      } else if (typeof cognitoGroups === 'string') {
        // Puede venir como JSON string: "[admin]" o "[admin,mentor]"
        try {
          const parsed = JSON.parse(cognitoGroups);
          groups = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          // Si no es JSON válido, tratarlo como string simple
          groups = [cognitoGroups];
        }
      }
    }

    // Crear objeto de usuario
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      username: decoded['cognito:username'] || decoded.email,
      groups: groups,
      tokenUse: decoded.token_use,
    };

    next();
  } catch (error) {
    console.error('❌ Error en autenticación:', error);
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



