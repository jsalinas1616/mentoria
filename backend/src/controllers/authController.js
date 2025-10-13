const authService = require('../services/authService');

class AuthController {
  async registrar(req, res, next) {
    try {
      const usuario = await authService.registrarUsuario(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
      }

      const resultado = await authService.login(email, password);
      res.json(resultado);
    } catch (error) {
      if (error.message === 'Credenciales inválidas') {
        return res.status(401).json({ message: error.message });
      }
      next(error);
    }
  }

  async obtenerUsuario(req, res, next) {
    try {
      const usuario = await authService.obtenerUsuario(req.user.id);
      
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();


