const consultasService = require('../services/consultasService');
const XLSX = require('xlsx');

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
      
      // Preparar datos para Excel
      const datosExcel = consultas.map(consulta => ({
        'Fecha': consulta.fecha,
        'Mentor': consulta.nombreMentor,
        'Correo Mentor': consulta.correoMentor,
        'Mentee': consulta.nombreMentee || 'N/A',
        'Correo Mentee': consulta.correoMentee || 'N/A',
        'Lugar de Trabajo': consulta.lugarTrabajo,
        'Área': consulta.area,
        'Lugar de Consulta': consulta.lugarConsulta,
        'Motivos de Consulta': consulta.motivosConsulta?.join(', ') || '',
        'Observaciones': consulta.observaciones || '',
        'Fecha de Creación': consulta.createdAt,
        'Última Actualización': consulta.updatedAt
      }));

      // Crear workbook de Excel
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      
      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 12 }, // Fecha
        { wch: 20 }, // Mentor
        { wch: 25 }, // Correo Mentor
        { wch: 20 }, // Mentee
        { wch: 25 }, // Correo Mentee
        { wch: 25 }, // Lugar de Trabajo
        { wch: 20 }, // Área
        { wch: 20 }, // Lugar de Consulta
        { wch: 30 }, // Motivos de Consulta
        { wch: 40 }, // Observaciones
        { wch: 20 }, // Fecha de Creación
        { wch: 20 }  // Última Actualización
      ];
      worksheet['!cols'] = columnWidths;

      // Agregar worksheet al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Consultas');
      
      // Generar buffer del archivo Excel
      const excelBuffer = XLSX.write(workbook, { 
        type: 'buffer', 
        bookType: 'xlsx'
      });
      
      // Configurar headers para descarga
      const fecha = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="consultas_${fecha}.xlsx"`);
      res.setHeader('Content-Length', excelBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Enviar archivo usando send en lugar de end
      res.send(excelBuffer);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ConsultasController();


