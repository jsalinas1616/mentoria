const { v4: uuidv4 } = require('uuid');
const { dynamodb, TABLES } = require('../config/database');

class EntrevistasService {
  async crear(consulta) {
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    const item = {
      id,
      ...consulta,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const params = {
      TableName: TABLES.ENTREVISTAS,
      Item: item,
    };

    await dynamodb.put(params).promise();
    return item;
  }

  async listar(filtros = {}) {
    const params = {
      TableName: TABLES.ENTREVISTAS,
    };

    const result = await dynamodb.scan(params).promise();
    let items = result.Items || [];

    // Convertir datos de DynamoDB a formato normal
    items = items.map(item => {
      const convertedItem = {};
      
      // Convertir cada campo de DynamoDB a formato normal
      Object.keys(item).forEach(key => {
        const value = item[key];
        
        if (value.S) {
          // String
          convertedItem[key] = value.S;
        } else if (value.N) {
          // Number
          convertedItem[key] = Number(value.N);
        } else if (value.SS) {
          // String Set (Array)
          convertedItem[key] = value.SS;
        } else if (value.L) {
          // List (Array) - convertir cada elemento
          convertedItem[key] = value.L.map(item => {
            if (item.S) return item.S;
            if (item.N) return Number(item.N);
            return item;
          });
        } else if (value.NS) {
          // Number Set (Array)
          convertedItem[key] = value.NS.map(n => Number(n));
        } else if (value.BOOL !== undefined) {
          // Boolean
          convertedItem[key] = value.BOOL;
        } else {
          // Mantener como está si no es un tipo conocido
          convertedItem[key] = value;
        }
      });
      
      return convertedItem;
    });

    // Aplicar filtros
    if (filtros.fechaInicio) {
      items = items.filter(item => item.fecha >= filtros.fechaInicio);
    }
    if (filtros.fechaFin) {
      items = items.filter(item => item.fecha <= filtros.fechaFin);
    }
    if (filtros.lugarTrabajo) {
      items = items.filter(item => 
        item.lugarTrabajo.toLowerCase().includes(filtros.lugarTrabajo.toLowerCase())
      );
    }
    if (filtros.area) {
      items = items.filter(item => 
        item.area.toLowerCase().includes(filtros.area.toLowerCase())
      );
    }

    // Ordenar por fecha descendente
    items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return items;
  }

  async obtener(id) {
    const params = {
      TableName: TABLES.ENTREVISTAS,
      Key: { id },
    };

    const result = await dynamodb.get(params).promise();
    if (!result.Item) return null;

    // Convertir datos de DynamoDB a formato normal
    const item = result.Item;
    const convertedItem = {};
    
    Object.keys(item).forEach(key => {
      const value = item[key];
      
      if (value.S) {
        convertedItem[key] = value.S;
      } else if (value.N) {
        convertedItem[key] = Number(value.N);
      } else if (value.SS) {
        convertedItem[key] = value.SS;
      } else if (value.L) {
        // List (Array) - convertir cada elemento
        convertedItem[key] = value.L.map(item => {
          if (item.S) return item.S;
          if (item.N) return Number(item.N);
          return item;
        });
      } else if (value.NS) {
        convertedItem[key] = value.NS.map(n => Number(n));
      } else if (value.BOOL !== undefined) {
        convertedItem[key] = value.BOOL;
      } else {
        convertedItem[key] = value;
      }
    });

    return convertedItem;
  }

  async actualizar(id, consulta) {
    const timestamp = new Date().toISOString();

    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(consulta).forEach((key) => {
      updateExpression.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = consulta[key];
    });

    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = timestamp;

    const params = {
      TableName: TABLES.ENTREVISTAS,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    const result = await dynamodb.update(params).promise();
    return result.Attributes;
  }

  async eliminar(id) {
    const params = {
      TableName: TABLES.ENTREVISTAS,
      Key: { id },
    };

    await dynamodb.delete(params).promise();
    return { message: 'Entrevista eliminada correctamente' };
  }

  async obtenerEstadisticas(filtros = {}) {
    const entrevistas = await this.listar(filtros);

    // Total de entrevistas
    const totalEntrevistas = entrevistas.length;

    // Consultas del mes actual
    const mesActual = new Date().getMonth();
    const añoActual = new Date().getFullYear();
    const entrevistasMes = entrevistas.filter(c => {
      const fecha = new Date(c.fecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
    }).length;

    // Motivos más frecuentes
    const motivosMap = {};
    entrevistas.forEach(c => {
      // Asegurar que motivosConsulta sea un array
      const motivos = Array.isArray(c.motivosConsulta) ? c.motivosConsulta : [];
      motivos.forEach(motivo => {
        motivosMap[motivo] = (motivosMap[motivo] || 0) + 1;
      });
    });
    const motivosMasFrecuentes = Object.entries(motivosMap)
      .map(([motivo, count]) => ({ motivo, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Lugares de trabajo
    const lugaresMap = {};
    entrevistas.forEach(c => {
      lugaresMap[c.lugarTrabajo] = (lugaresMap[c.lugarTrabajo] || 0) + 1;
    });
    const lugaresTrabajo = Object.entries(lugaresMap)
      .map(([lugar, count]) => ({ lugar, count }))
      .sort((a, b) => b.count - a.count);

    // Consultas por fecha (últimos 30 días)
    const fechasMap = {};
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    entrevistas
      .filter(c => new Date(c.fecha) >= hace30Dias)
      .forEach(c => {
        const fecha = c.fecha;
        fechasMap[fecha] = (fechasMap[fecha] || 0) + 1;
      });
    
    const entrevistasPorFecha = Object.entries(fechasMap)
      .map(([fecha, count]) => ({ fecha, count }))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    return {
      totalEntrevistas,
      entrevistasMes,
      motivosMasFrecuentes,
      lugaresTrabajo,
      entrevistasPorFecha,
    };
  }
}

module.exports = new ConsultasService();



