const entrevistasService = require('../services/entrevistasService');
const XLSX = require('xlsx');

class EntrevistasController {
  async crear(req, res, next) {
    try {
      const entrevista = await entrevistasService.crear(req.body);
      res.status(201).json(entrevista);
    } catch (error) {
      next(error);
    }
  }

  async listar(req, res, next) {
    try {
      const filtros = req.query;
      const entrevistas = await entrevistasService.listar(filtros);
      res.json(entrevistas);
    } catch (error) {
      next(error);
    }
  }

  async obtener(req, res, next) {
    try {
      const { id } = req.params;
      const entrevista = await entrevistasService.obtener(id);
      
      if (!entrevista) {
        return res.status(404).json({ message: 'Entrevista no encontrada' });
      }
      
      res.json(entrevista);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const entrevista = await entrevistasService.actualizar(id, req.body);
      res.json(entrevista);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await entrevistasService.eliminar(id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async exportar(req, res, next) {
    try {
      const filtros = req.query;
      const entrevistas = await entrevistasService.listar(filtros);
      
      // Preparar datos para Excel
      const datosExcel = entrevistas.map(entrevista => ({
        'Fecha': entrevista.fecha,
        'Mentores': entrevista.mentores?.join(', ') || 'N/A',
        'Sexo': entrevista.sexo || 'N/A',
        'Rango de Edad': entrevista.rangoEdad || 'N/A',
        'Número de Sesión': entrevista.numeroSesion || 'N/A',
        'Lugar de Trabajo': entrevista.lugarTrabajo,
        'Área': entrevista.area,
        'Lugar de Entrevista': entrevista.lugarEntrevista,
        'Motivos de Entrevista': entrevista.motivosEntrevista?.join(', ') || '',
        'Observaciones': entrevista.observaciones || '',
        'Fecha de Creación': entrevista.createdAt,
        'Última Actualización': entrevista.updatedAt
      }));

      // Crear workbook de Excel
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      
      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 12 }, // Fecha
        { wch: 30 }, // Entrevisatdores (puede ser varios)
        { wch: 15 }, // Sexo
        { wch: 15 }, // Rango de Edad
        { wch: 18 }, // Número de Sesión
        { wch: 25 }, // Lugar de Trabajo
        { wch: 20 }, // Área
        { wch: 22 }, // Lugar de Entrevista
        { wch: 35 }, // Motivos de Entrevista
        { wch: 40 }, // Observaciones
        { wch: 20 }, // Fecha de Creación
        { wch: 20 }  // Última Actualización
      ];
      worksheet['!cols'] = columnWidths;

      // Agregar worksheet al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Entrevistas');
      
      // Generar buffer del archivo Excel
      const excelBuffer = XLSX.write(workbook, { 
        type: 'buffer', 
        bookType: 'xlsx'
      });
      
      // Configurar headers para descarga
      const fecha = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="entrevistas_${fecha}.xlsx"`);
      res.setHeader('Content-Length', excelBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Enviar archivo usando send en lugar de end
      res.send(excelBuffer);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EntrevistasController();


