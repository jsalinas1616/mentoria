const visitasService = require('../services/visitasService');
const XLSX = require('xlsx');

class VisitasController {
  async crear(req, res, next) {
    try {
      const visita = await visitasService.crear(req.body);
      res.status(201).json(visita);
    } catch (error) {
      next(error);
    }
  }

  async listar(req, res, next) {
    try {
      const filtros = req.query;
      const visitas = await visitasService.listar(filtros);
      res.json(visitas);
    } catch (error) {
      next(error);
    }
  }

  async obtener(req, res, next) {
    try {
      const { id } = req.params;
      const visita = await visitasService.obtener(id);
      
      if (!visita) {
        return res.status(404).json({ message: 'Visita no encontrada' });
      }
      
      res.json(visita);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const visita = await visitasService.actualizar(id, req.body);
      res.json(visita);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await visitasService.eliminar(id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async exportar(req, res, next) {
    try {
      const filtros = req.query;
      const visitas = await visitasService.listar(filtros);
      
      // Preparar datos para Excel
      const datosExcel = visitas.map(visita => ({
        'Fecha': visita.fecha,
        'Mentores': visita.mentores?.join(', ') || 'N/A',
        'Lugar de Visita': visita.lugarVisita,
        'Sexo': visita.sexo || 'N/A',
        'Rango de Edad': visita.rangoEdad || 'N/A',
        'Parentesco': visita.parentesco,
        'Área de Personal': visita.areaPersonal,
        'Observaciones': visita.observaciones || '',
        'Fecha de Creación': visita.createdAt,
        'Última Actualización': visita.updatedAt
      }));

      // Crear workbook de Excel
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      
      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 12 }, // Fecha
        { wch: 30 }, // Mentores
        { wch: 18 }, // Lugar de Visita
        { wch: 15 }, // Sexo
        { wch: 15 }, // Rango de Edad
        { wch: 18 }, // Parentesco
        { wch: 25 }, // Área de Personal
        { wch: 40 }, // Observaciones
        { wch: 20 }, // Fecha de Creación
        { wch: 20 }  // Última Actualización
      ];
      worksheet['!cols'] = columnWidths;

      // Agregar worksheet al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitas');
      
      // Generar buffer del archivo Excel
      const excelBuffer = XLSX.write(workbook, { 
        type: 'buffer', 
        bookType: 'xlsx'
      });
      
      // Configurar headers para descarga
      const fecha = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="visitas_${fecha}.xlsx"`);
      res.setHeader('Content-Length', excelBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Enviar archivo
      res.send(excelBuffer);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VisitasController();
