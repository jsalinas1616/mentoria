const { v4: uuidv4 } = require('uuid');
const { dynamodb, TABLES } = require('../config/database');

class VisitasService {
  async crear(visita) {
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    const item = {
      id,
      ...visita,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const params = {
      TableName: TABLES.VISITAS,
      Item: item,
    };

    await dynamodb.put(params).promise();
    return item;
  }

  async listar(filtros = {}) {
    const params = {
      TableName: TABLES.VISITAS,
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
    if (filtros.lugarVisita) {
      items = items.filter(item => 
        item.lugarVisita.toLowerCase().includes(filtros.lugarVisita.toLowerCase())
      );
    }
    if (filtros.parentesco) {
      items = items.filter(item => 
        item.parentesco.toLowerCase().includes(filtros.parentesco.toLowerCase())
      );
    }

    // Ordenar por fecha descendente
    items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return items;
  }

  async obtener(id) {
    const params = {
      TableName: TABLES.VISITAS,
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

  async actualizar(id, visita) {
    const timestamp = new Date().toISOString();

    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(visita).forEach((key) => {
      updateExpression.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = visita[key];
    });

    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = timestamp;

    const params = {
      TableName: TABLES.VISITAS,
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
      TableName: TABLES.VISITAS,
      Key: { id },
    };

    await dynamodb.delete(params).promise();
    return { message: 'Visita eliminada correctamente' };
  }

  async obtenerEstadisticas(filtros = {}) {
    const visitas = await this.listar(filtros);

    // Total de visitas
    const totalVisitas = visitas.length;

    // Visitas del mes actual
    const mesActual = new Date().getMonth();
    const añoActual = new Date().getFullYear();
    const visitasMes = visitas.filter(v => {
      const fecha = new Date(v.fecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
    }).length;

    // Lugares más visitados
    const lugaresMap = {};
    visitas.forEach(v => {
      lugaresMap[v.lugarVisita] = (lugaresMap[v.lugarVisita] || 0) + 1;
    });
    const lugaresMasFrecuentes = Object.entries(lugaresMap)
      .map(([lugar, count]) => ({ lugar, count }))
      .sort((a, b) => b.count - a.count);

    // Parentesco más frecuente
    const parentescoMap = {};
    visitas.forEach(v => {
      parentescoMap[v.parentesco] = (parentescoMap[v.parentesco] || 0) + 1;
    });
    const parentescosMasFrecuentes = Object.entries(parentescoMap)
      .map(([parentesco, count]) => ({ parentesco, count }))
      .sort((a, b) => b.count - a.count);

    // Áreas de personal
    const areasMap = {};
    visitas.forEach(v => {
      areasMap[v.areaPersonal] = (areasMap[v.areaPersonal] || 0) + 1;
    });
    const areasMasFrecuentes = Object.entries(areasMap)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count);

    // Visitas por fecha (últimos 30 días)
    const fechasMap = {};
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    visitas
      .filter(v => new Date(v.fecha) >= hace30Dias)
      .forEach(v => {
        const fecha = v.fecha;
        fechasMap[fecha] = (fechasMap[fecha] || 0) + 1;
      });
    
    const visitasPorFecha = Object.entries(fechasMap)
      .map(([fecha, count]) => ({ fecha, count }))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    return {
      totalVisitas,
      visitasMes,
      lugaresMasFrecuentes,
      parentescosMasFrecuentes,
      areasMasFrecuentes,
      visitasPorFecha,
    };
  }
}

module.exports = new VisitasService();
