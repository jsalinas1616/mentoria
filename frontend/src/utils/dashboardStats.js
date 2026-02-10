// Calcular estadísticas para Entrevistas (Consultas + Entrevistas combinadas)
export const calcularStatsEntrevistas = (entrevistas) => {
  if (!entrevistas || entrevistas.length === 0) {
    return {
      total: 0,
      esteMes: 0,
      motivoPrincipal: '',
      motivosCount: 0,
      lugaresActivos: 0,
      motivosMasFrecuentes: [],
      lugaresTrabajo: [],
      tendenciaMensual: [],
      distribucionSexo: [],
      distribucionEdad: []
    };
  }

  // Total
  const total = entrevistas.length;

  // Este mes
  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const añoActual = hoy.getFullYear();
  const esteMes = entrevistas.filter(e => {
    const fecha = new Date(e.fecha);
    return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
  }).length;

  // Motivos más frecuentes
  const motivosMap = {};
  entrevistas.forEach(e => {
    const motivos = e.motivosEntrevista || e.motivosConsulta || [];
    motivos.forEach(motivo => {
      motivosMap[motivo] = (motivosMap[motivo] || 0) + 1;
    });
  });
  
  const motivosMasFrecuentes = Object.entries(motivosMap)
    .map(([motivo, count]) => ({ motivo, count }))
    .sort((a, b) => b.count - a.count);

  const motivoPrincipal = motivosMasFrecuentes[0]?.motivo || 'N/A';
  const motivosCount = motivosMasFrecuentes[0]?.count || 0;

  // Lugares de trabajo
  const lugaresMap = {};
  entrevistas.forEach(e => {
    if (e.lugarTrabajo) {
      lugaresMap[e.lugarTrabajo] = (lugaresMap[e.lugarTrabajo] || 0) + 1;
    }
  });
  
  const lugaresTrabajo = Object.entries(lugaresMap)
    .map(([lugar, count]) => ({ lugar, count }))
    .sort((a, b) => b.count - a.count);

  const lugaresActivos = Object.keys(lugaresMap).length;

  // Tendencia mensual (últimos 6 meses)
  const hace6Meses = new Date();
  hace6Meses.setMonth(hace6Meses.getMonth() - 6);
  
  const mesesMap = {};
  entrevistas
    .filter(e => new Date(e.fecha) >= hace6Meses)
    .forEach(e => {
      const fecha = new Date(e.fecha);
      const mesAño = `${fecha.getMonth() + 1}/${fecha.getFullYear().toString().slice(2)}`;
      mesesMap[mesAño] = (mesesMap[mesAño] || 0) + 1;
    });

  const tendenciaMensual = Object.entries(mesesMap)
    .map(([mes, count]) => ({ mes, count }))
    .sort((a, b) => {
      const [mesA, añoA] = a.mes.split('/');
      const [mesB, añoB] = b.mes.split('/');
      return new Date(`20${añoA}-${mesA}`) - new Date(`20${añoB}-${mesB}`);
    });

  // Distribución por sexo
  const sexoMap = {};
  entrevistas.forEach(e => {
    if (e.sexo) {
      sexoMap[e.sexo] = (sexoMap[e.sexo] || 0) + 1;
    }
  });
  
  const distribucionSexo = Object.entries(sexoMap)
    .map(([sexo, count]) => ({ sexo, count }));

  // Distribución por edad
  const edadMap = {};
  entrevistas.forEach(e => {
    if (e.rangoEdad) {
      edadMap[e.rangoEdad] = (edadMap[e.rangoEdad] || 0) + 1;
    }
  });
  
  const distribucionEdad = Object.entries(edadMap)
    .map(([rango, count]) => ({ rango, count }))
    .sort((a, b) => {
      const orden = { '18-25': 1, '26-35': 2, '36-45': 3, '46-55': 4, '56+': 5 };
      return (orden[a.rango] || 999) - (orden[b.rango] || 999);
    });

  return {
    total,
    esteMes,
    motivoPrincipal,
    motivosCount,
    lugaresActivos,
    motivosMasFrecuentes: motivosMasFrecuentes.slice(0, 8),
    lugaresTrabajo: lugaresTrabajo.slice(0, 8),
    tendenciaMensual,
    distribucionSexo,
    distribucionEdad
  };
};

// Calcular estadísticas para Capacitaciones
export const calcularStatsCapacitaciones = (capacitaciones) => {
  if (!capacitaciones || capacitaciones.length === 0) {
    return {
      total: 0,
      esteMes: 0,
      totalAsistentes: 0,
      temaPrincipal: '',
      temaCount: 0,
      cdrsActivos: 0,
      temasMasImpartidos: [],
      distribucionCDR: [],
      tendenciaMensual: [],
      promedioAsistentes: 0
    };
  }

  // Total
  const total = capacitaciones.length;

  // Este mes
  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const añoActual = hoy.getFullYear();
  const esteMes = capacitaciones.filter(c => {
    const fecha = new Date(c.fecha);
    return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
  }).length;

  // Total de asistentes
  const totalAsistentes = capacitaciones.reduce((sum, c) => 
    sum + (c.numeroPersonasInvitadas || 0), 0
  );

  const promedioAsistentes = total > 0 ? Math.round(totalAsistentes / total) : 0;

  // Temas más impartidos
  const temasMap = {};
  capacitaciones.forEach(c => {
    if (c.tema) {
      temasMap[c.tema] = (temasMap[c.tema] || 0) + 1;
    }
  });
  
  const temasMasImpartidos = Object.entries(temasMap)
    .map(([tema, count]) => ({ tema, count }))
    .sort((a, b) => b.count - a.count);

  const temaPrincipal = temasMasImpartidos[0]?.tema || 'N/A';
  const temaCount = temasMasImpartidos[0]?.count || 0;

  // Distribución por CDR
  const cdrMap = {};
  capacitaciones.forEach(c => {
    if (c.lugar) {
      cdrMap[c.lugar] = (cdrMap[c.lugar] || 0) + 1;
    }
  });
  
  const distribucionCDR = Object.entries(cdrMap)
    .map(([cdr, count]) => ({ cdr, count }))
    .sort((a, b) => b.count - a.count);

  const cdrsActivos = Object.keys(cdrMap).length;

  // Tendencia mensual (últimos 6 meses)
  const hace6Meses = new Date();
  hace6Meses.setMonth(hace6Meses.getMonth() - 6);
  
  const mesesMap = {};
  capacitaciones
    .filter(c => new Date(c.fecha) >= hace6Meses)
    .forEach(c => {
      const fecha = new Date(c.fecha);
      const mesAño = `${fecha.getMonth() + 1}/${fecha.getFullYear().toString().slice(2)}`;
      mesesMap[mesAño] = (mesesMap[mesAño] || 0) + 1;
    });

  const tendenciaMensual = Object.entries(mesesMap)
    .map(([mes, count]) => ({ mes, count }))
    .sort((a, b) => {
      const [mesA, añoA] = a.mes.split('/');
      const [mesB, añoB] = b.mes.split('/');
      return new Date(`20${añoA}-${mesA}`) - new Date(`20${añoB}-${mesB}`);
    });

  return {
    total,
    esteMes,
    totalAsistentes,
    temaPrincipal,
    temaCount,
    cdrsActivos,
    temasMasImpartidos: temasMasImpartidos.slice(0, 8),
    distribucionCDR: distribucionCDR.slice(0, 8),
    tendenciaMensual,
    promedioAsistentes
  };
};

// Calcular estadísticas para Acercamientos (Contacto de vida)
export const calcularStatsAcercamientos = (acercamientos) => {
  if (!acercamientos || acercamientos.length === 0) {
    return {
      total: 0,
      esteMes: 0,
      estadoPrincipal: '',
      estadoCount: 0,
      seguimientosActivos: 0,
      estadosMasFrecuentes: [],
      distribucionSeguimiento: [],
      tendenciaMensual: [],
      evolucionCasos: []
    };
  }

  // Total
  const total = acercamientos.length;

  // Este mes
  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const añoActual = hoy.getFullYear();
  const esteMes = acercamientos.filter(a => {
    const fecha = new Date(a.fecha);
    return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
  }).length;

  // Estados de ánimo más frecuentes
  const estadosMap = {};
  acercamientos.forEach(a => {
    const estados = a.estadosAnimo || [];
    estados.forEach(estado => {
      estadosMap[estado] = (estadosMap[estado] || 0) + 1;
    });
  });
  
  const estadosMasFrecuentes = Object.entries(estadosMap)
    .map(([estado, count]) => ({ estado, count }))
    .sort((a, b) => b.count - a.count);

  const estadoPrincipal = estadosMasFrecuentes[0]?.estado || 'N/A';
  const estadoCount = estadosMasFrecuentes[0]?.count || 0;

  // Distribución por tipo de seguimiento
  const seguimientoMap = {};
  acercamientos.forEach(a => {
    if (a.seguimiento) {
      seguimientoMap[a.seguimiento] = (seguimientoMap[a.seguimiento] || 0) + 1;
    }
  });
  
  const distribucionSeguimiento = Object.entries(seguimientoMap)
    .map(([seguimiento, count]) => ({ seguimiento, count }))
    .sort((a, b) => b.count - a.count);

  const seguimientosActivos = acercamientos.filter(a => 
    a.seguimiento !== 'Alta'
  ).length;

  // Tendencia mensual (últimos 6 meses)
  const hace6Meses = new Date();
  hace6Meses.setMonth(hace6Meses.getMonth() - 6);
  
  const mesesMap = {};
  acercamientos
    .filter(a => new Date(a.fecha) >= hace6Meses)
    .forEach(a => {
      const fecha = new Date(a.fecha);
      const mesAño = `${fecha.getMonth() + 1}/${fecha.getFullYear().toString().slice(2)}`;
      mesesMap[mesAño] = (mesesMap[mesAño] || 0) + 1;
    });

  const tendenciaMensual = Object.entries(mesesMap)
    .map(([mes, count]) => ({ mes, count }))
    .sort((a, b) => {
      const [mesA, añoA] = a.mes.split('/');
      const [mesB, añoB] = b.mes.split('/');
      return new Date(`20${añoA}-${mesA}`) - new Date(`20${añoB}-${mesB}`);
    });

  // Evolución de casos (por número de acercamiento)
  const evolucionMap = {};
  acercamientos.forEach(a => {
    const num = a.numeroAcercamiento || 1;
    const label = num === 1 ? 'Sesión 1' : 
                  num === 2 ? 'Sesión 2' :
                  num === 3 ? 'Sesión 3' :
                  num === 4 ? 'Sesión 4' :
                  'Sesión 5+';
    evolucionMap[label] = (evolucionMap[label] || 0) + 1;
  });

  const evolucionCasos = Object.entries(evolucionMap)
    .map(([sesion, count]) => ({ sesion, count }))
    .sort((a, b) => {
      const orden = { 'Sesión 1': 1, 'Sesión 2': 2, 'Sesión 3': 3, 'Sesión 4': 4, 'Sesión 5+': 5 };
      return (orden[a.sesion] || 999) - (orden[b.sesion] || 999);
    });

  return {
    total,
    esteMes,
    estadoPrincipal,
    estadoCount,
    seguimientosActivos,
    estadosMasFrecuentes: estadosMasFrecuentes.slice(0, 10),
    distribucionSeguimiento,
    tendenciaMensual,
    evolucionCasos
  };
};
