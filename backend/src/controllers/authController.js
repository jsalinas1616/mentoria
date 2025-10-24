const cognitoService = require('../services/cognitoService');

class AuthController {
  /**
   * Obtener información del usuario autenticado
   */
  async obtenerUsuario(req, res, next) {
    try {
      const { email } = req.user;
      
      // Obtener info completa de Cognito
      const userInfo = await cognitoService.getUserInfo(email);
      const groups = await cognitoService.getUserGroups(email);

      res.json({
        ...userInfo,
        roles: groups,
        rol: groups.includes('admin') ? 'admin' : 'mentor',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear nuevo usuario en Cognito (solo admin)
   */
  async crearUsuario(req, res, next) {
    try {
      const { email, nombre, password, rol } = req.body;

      if (!email || !nombre || !password || !rol) {
        return res.status(400).json({ 
          message: 'Email, nombre, contraseña y rol son requeridos' 
        });
      }

      // Validar que el rol sea válido
      const rolesValidos = ['admin', 'mentor'];
      if (!rolesValidos.includes(rol)) {
        return res.status(400).json({ 
          message: `Rol inválido. Debe ser: admin o mentor` 
        });
      }

      const usuario = await cognitoService.createUser(
        email,
        nombre,
        password,
        rol
      );

      res.status(201).json(usuario);
    } catch (error) {
      if (error.code === 'UsernameExistsException') {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }
      next(error);
    }
  }

  /**
   * Cambiar rol del usuario (solo admin)
   */
  async cambiarRol(req, res, next) {
    try {
      const { email } = req.params;
      const { nuevoRol, rolAnterior } = req.body;

      if (!nuevoRol) {
        return res.status(400).json({ message: 'Nuevo rol es requerido' });
      }

      // Validar que el rol sea válido
      const rolesValidos = ['admin', 'mentor'];
      if (!rolesValidos.includes(nuevoRol)) {
        return res.status(400).json({ 
          message: `Rol inválido. Debe ser: admin o mentor` 
        });
      }

      // Remover del rol anterior si se proporciona
      if (rolAnterior) {
        await cognitoService.removeUserFromGroup(email, rolAnterior);
      }

      // Agregar al nuevo rol
      await cognitoService.addUserToGroup(email, nuevoRol);

      res.json({ 
        success: true, 
        message: `Rol actualizado a ${nuevoRol}` 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar usuarios (solo admin)
   */
  async listarUsuarios(req, res, next) {
    try {
      const usuarios = await cognitoService.listUsers();
      
      // Obtener grupos de cada usuario
      const usuariosConRoles = await Promise.all(
        usuarios.map(async (user) => {
          const groups = await cognitoService.getUserGroups(user.username);
          return {
            ...user,
            roles: groups,
            rol: groups.includes('admin') ? 'admin' : 'mentor',
          };
        })
      );

      res.json(usuariosConRoles);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deshabilitar usuario (solo admin)
   */
  async deshabilitarUsuario(req, res, next) {
    try {
      const { email } = req.params;
      const result = await cognitoService.disableUser(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Habilitar usuario (solo admin)
   */
  async habilitarUsuario(req, res, next) {
    try {
      const { email } = req.params;
      const result = await cognitoService.enableUser(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cambiar contraseña del usuario (solo admin)
   */
  async cambiarPassword(req, res, next) {
    try {
      const { email } = req.params;
      const { password, permanent } = req.body;

      if (!password) {
        return res.status(400).json({ message: 'Contraseña es requerida' });
      }

      const result = await cognitoService.setUserPassword(email, password, permanent !== false);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();



