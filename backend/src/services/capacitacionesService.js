const { v4: uuidv4 } = require('uuid');
const { dynamodb, TABLES } = require('../config/database');

class CapacitacionesService {
  async crear(capacitacion) {
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    const item = {
      id,
      ...capacitacion,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const params = {
      TableName: TABLES.CAPACITACIONES,
      Item: item,
    };

    await dynamodb.put(params).promise();
    return item;
  }

  async listar(filtros = {}) {
    const params = {
      TableName: TABLES.CAPACITACIONES,
    };

    const result = await dynamodb.scan(params).promise();
    let items = result.Items || [];

    // Aplicar filtros
    if (filtros.fechaInicio) {
      items = items.filter(item => item.fecha >= filtros.fechaInicio);
    }
    if (filtros.fechaFin) {
      items = items.filter(item => item.fecha <= filtros.fechaFin);
    }
    if (filtros.tema) {
      items = items.filter(item => 
        item.tema && item.tema.toLowerCase().includes(filtros.tema.toLowerCase())
      );
    }

    // Ordenar por fecha descendente
    items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return items;
  }

  async obtenerPorId(id) {
    const params = {
      TableName: TABLES.CAPACITACIONES,
      Key: { id },
    };

    const result = await dynamodb.get(params).promise();
    
    if (!result.Item) {
      const error = new Error('Capacitación no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return result.Item;
  }

  async actualizar(id, datosActualizados) {
    // Verificar que existe
    await this.obtenerPorId(id);

    const timestamp = new Date().toISOString();
    const item = {
      ...datosActualizados,
      id,
      updatedAt: timestamp,
    };

    const params = {
      TableName: TABLES.CAPACITACIONES,
      Item: item,
    };

    await dynamodb.put(params).promise();
    return item;
  }

  async eliminar(id) {
    // Verificar que existe
    await this.obtenerPorId(id);

    const params = {
      TableName: TABLES.CAPACITACIONES,
      Key: { id },
    };

    await dynamodb.delete(params).promise();
    return { message: 'Capacitación eliminada exitosamente', id };
  }

  async obtenerEstadisticas(filtros = {}) {
    const capacitaciones = await this.listar(filtros);

    const estadisticas = {
      total: capacitaciones.length,
      totalPersonasInvitadas: 0,
      totalAsistentes: 0,
      porcentajeAsistencia: 0,
      capacitacionesPorMes: {},
      temasMasComunes: {},
      demograficos: {
        rangoEdad: {},
        sexo: {},
        areas: {},
        lugaresTrabajo: {}
      }
    };

    capacitaciones.forEach(cap => {
      // Contadores generales
      estadisticas.totalPersonasInvitadas += cap.numeroPersonasInvitadas || 0;
      estadisticas.totalAsistentes += (cap.asistentes || []).length;

      // Por mes
      const mes = cap.fecha ? cap.fecha.substring(0, 7) : 'Sin fecha';
      estadisticas.capacitacionesPorMes[mes] = (estadisticas.capacitacionesPorMes[mes] || 0) + 1;

      // Temas
      if (cap.tema) {
        estadisticas.temasMasComunes[cap.tema] = (estadisticas.temasMasComunes[cap.tema] || 0) + 1;
      }

      // Demográficos
      (cap.asistentes || []).forEach(asistente => {
        if (asistente.rangoEdad) {
          estadisticas.demograficos.rangoEdad[asistente.rangoEdad] = 
            (estadisticas.demograficos.rangoEdad[asistente.rangoEdad] || 0) + 1;
        }
        if (asistente.sexo) {
          estadisticas.demograficos.sexo[asistente.sexo] = 
            (estadisticas.demograficos.sexo[asistente.sexo] || 0) + 1;
        }
        if (asistente.area) {
          estadisticas.demograficos.areas[asistente.area] = 
            (estadisticas.demograficos.areas[asistente.area] || 0) + 1;
        }
        if (asistente.lugarTrabajo) {
          estadisticas.demograficos.lugaresTrabajo[asistente.lugarTrabajo] = 
            (estadisticas.demograficos.lugaresTrabajo[asistente.lugarTrabajo] || 0) + 1;
        }
      });
    });

    // Calcular porcentaje de asistencia
    if (estadisticas.totalPersonasInvitadas > 0) {
      estadisticas.porcentajeAsistencia = 
        ((estadisticas.totalAsistentes / estadisticas.totalPersonasInvitadas) * 100).toFixed(2);
    }

    return estadisticas;
  }
}

module.exports = new CapacitacionesService();

