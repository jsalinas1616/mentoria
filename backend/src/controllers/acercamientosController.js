const acercamientosService = require('../services/acercamientosService');
const XLSX = require('xlsx');

class AcercamientosController {
  async crear(req, res, next) {
    try {
      const acercamiento = await acercamientosService.crear(req.body);
      res.status(201).json(acercamiento);
    } catch (error) {
      next(error);
    }
  }

  async listar(req, res, next) {
    try {
      const filtros = req.query;
      const acercamientos = await acercamientosService.listar(filtros);
      res.json(acercamientos);
    } catch (error) {
      next(error);
    }
  }

  async obtener(req, res, next) {
    try {
      const { id } = req.params;
      const acercamiento = await acercamientosService.obtener(id);
      
      if (!acercamiento) {
        return res.status(404).json({ message: 'Acercamiento no encontrado' });
      }
      
      res.json(acercamiento);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const acercamiento = await acercamientosService.actualizar(id, req.body);
      res.json(acercamiento);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await acercamientosService.eliminar(id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async exportar(req, res, next) {
    try {
      const filtros = req.query;
      const acercamientos = await acercamientosService.listar(filtros);
      
      // Preparar datos para Excel
      const datosExcel = acercamientos.map(acercamiento => ({
        'Fecha': acercamiento.fecha,
        'Mentores': acercamiento.mentores?.join(', ') || 'N/A',
        'Sexo': acercamiento.sexo || 'N/A',
        'Rango de Edad': acercamiento.rangoEdad || 'N/A',
        'Número de Acercamiento': acercamiento.numeroAcercamiento || 'N/A',
        'Lugar de Trabajo': acercamiento.lugarTrabajo,
        'Área': acercamiento.area,
        'Lugar de Acercamiento': acercamiento.lugarAcercamiento,
        'Seguimiento': acercamiento.seguimiento || '',
        'Estado de ánimo': acercamiento.estadosAnimo?.join(', ') || '',
        'Observaciones': acercamiento.observaciones || '',
        'Fecha de Creación': acercamiento.createdAt,
        'Última Actualización': acercamiento.updatedAt
      }));

      // Crear workbook de Excel
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      
      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 12 }, // Fecha
        { wch: 30 }, // Mentores (puede ser varios)
        { wch: 15 }, // Sexo
        { wch: 15 }, // Rango de Edad
        { wch: 18 }, // Número de Acercamiento
        { wch: 25 }, // Lugar de Trabajo
        { wch: 20 }, // Área
        { wch: 24 }, // Lugar de Acercamiento
        { wch: 20 }, // Seguimiento
        { wch: 35 }, // Estado de ánimo
        { wch: 40 }, // Observaciones
        { wch: 20 }, // Fecha de Creación
        { wch: 20 }  // Última Actualización
      ];
      worksheet['!cols'] = columnWidths;

      // Agregar worksheet al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Acercamientos');
      
      // Generar buffer del archivo Excel
      const excelBuffer = XLSX.write(workbook, { 
        type: 'buffer', 
        bookType: 'xlsx'
      });
      
      // Configurar headers para descarga
      const fecha = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="acercamientos_${fecha}.xlsx"`);
      res.setHeader('Content-Length', excelBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Enviar archivo usando send en lugar de end
      res.send(excelBuffer);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AcercamientosController();


