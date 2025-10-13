const consultasService = require('../services/consultasService');

class DashboardController {
  async obtenerEstadisticas(req, res, next) {
    try {
      const filtros = req.query;
      const estadisticas = await consultasService.obtenerEstadisticas(filtros);
      res.json(estadisticas);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();


