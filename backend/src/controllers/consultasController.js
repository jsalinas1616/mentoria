const consultasService = require('../services/consultasService');

class ConsultasController {
  async crear(req, res, next) {
    try {
      const consulta = await consultasService.crear(req.body);
      res.status(201).json(consulta);
    } catch (error) {
      next(error);
    }
  }

  async listar(req, res, next) {
    try {
      const filtros = req.query;
      const consultas = await consultasService.listar(filtros);
      res.json(consultas);
    } catch (error) {
      next(error);
    }
  }

  async obtener(req, res, next) {
    try {
      const { id } = req.params;
      const consulta = await consultasService.obtener(id);
      
      if (!consulta) {
        return res.status(404).json({ message: 'Consulta no encontrada' });
      }
      
      res.json(consulta);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const consulta = await consultasService.actualizar(id, req.body);
      res.json(consulta);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await consultasService.eliminar(id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async exportar(req, res, next) {
    try {
      const filtros = req.query;
      const consultas = await consultasService.listar(filtros);
      
      // Por ahora retornar JSON, se puede implementar Excel/PDF después
      res.json(consultas);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ConsultasController();


