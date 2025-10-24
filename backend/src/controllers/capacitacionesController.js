const capacitacionesService = require('../services/capacitacionesService');
// const ExcelJS = require('exceljs'); // TODO: Descomentar cuando se implemente exportación

class CapacitacionesController {
  async crear(req, res, next) {
    try {
      const capacitacion = await capacitacionesService.crear(req.body);
      res.status(201).json({
        message: 'Capacitación creada exitosamente',
        data: capacitacion,
      });
    } catch (error) {
      next(error);
    }
  }

  async listar(req, res, next) {
    try {
      const filtros = req.query;
      const capacitaciones = await capacitacionesService.listar(filtros);
      res.json({
        message: 'Capacitaciones obtenidas exitosamente',
        data: capacitaciones,
        total: capacitaciones.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async obtener(req, res, next) {
    try {
      const { id } = req.params;
      const capacitacion = await capacitacionesService.obtenerPorId(id);
      res.json({
        message: 'Capacitación obtenida exitosamente',
        data: capacitacion,
      });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const capacitacion = await capacitacionesService.actualizar(id, req.body);
      res.json({
        message: 'Capacitación actualizada exitosamente',
        data: capacitacion,
      });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const result = await capacitacionesService.eliminar(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async exportar(req, res, next) {
    try {
      const filtros = req.query;
      const capacitaciones = await capacitacionesService.listar(filtros);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Capacitaciones');

      // Definir columnas
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 40 },
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Hora', key: 'hora', width: 10 },
        { header: 'Tema', key: 'tema', width: 40 },
        { header: 'Duración', key: 'duracion', width: 15 },
        { header: 'Lugar', key: 'lugar', width: 30 },
        { header: 'Capacitadores', key: 'capacitadores', width: 50 },
        { header: 'Personas Invitadas', key: 'numeroPersonasInvitadas', width: 20 },
        { header: 'Asistentes', key: 'numAsistentes', width: 15 },
        { header: 'Observaciones', key: 'observaciones', width: 50 },
        { header: 'Fecha Creación', key: 'createdAt', width: 20 },
      ];

      // Agregar datos
      capacitaciones.forEach(cap => {
        worksheet.addRow({
          id: cap.id,
          fecha: cap.fecha || '',
          hora: cap.hora || '',
          tema: cap.tema || '',
          duracion: cap.duracion || '',
          lugar: cap.lugar || '',
          capacitadores: (cap.capacitadores || []).join(', '),
          numeroPersonasInvitadas: cap.numeroPersonasInvitadas || 0,
          numAsistentes: (cap.asistentes || []).length,
          observaciones: cap.observaciones || '',
          createdAt: cap.createdAt || '',
        });
      });

      // Estilo del header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4CAF50' }
      };

      // Generar archivo
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=capacitaciones-${new Date().toISOString().split('T')[0]}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CapacitacionesController();

