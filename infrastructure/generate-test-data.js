const AWS = require('aws-sdk');

// Configurar AWS
AWS.config.update({
  region: 'us-east-1'
});

const dynamodb = new AWS.DynamoDB();

// Datos de prueba para los nuevos campos
const rangosEdad = ['18-25', '26-35', '36-45', '46-55', '56-65', '66-75', '76-80', '80+'];
const sexos = ['Hombre', 'Mujer'];
const lugaresTrabajo = [
  'Oficina Central', 'Sucursal Norte', 'Sucursal Sur', 'Sucursal Este', 'Sucursal Oeste',
  'Planta Industrial', 'Centro de Distribución', 'Oficina Regional', 'Sede Corporativa'
];
const areas = [
  'Recursos Humanos', 'Finanzas', 'Ventas', 'Marketing', 'Operaciones',
  'Tecnología', 'Logística', 'Producción', 'Calidad', 'Administración',
  'Comercial', 'Desarrollo', 'Investigación', 'Servicio al Cliente'
];
const lugaresConsulta = [
  'Oficina del Mentor', 'Sala de Juntas', 'Espacio Colaborativo', 'Oficina Privada',
  'Área de Descanso', 'Sala de Capacitación', 'Espacio Virtual', 'Cafetería'
];
const motivosConsulta = [
  'Desarrollo de Liderazgo', 'Gestión del Tiempo', 'Comunicación Efectiva', 'Toma de Decisiones',
  'Manejo de Conflictos', 'Planificación Estratégica', 'Motivación de Equipos', 'Presentaciones',
  'Networking', 'Crecimiento Profesional', 'Balance Vida-Trabajo', 'Innovación',
  'Negociación', 'Pensamiento Crítico', 'Adaptabilidad', 'Resolución de Problemas'
];
const nombresMentores = [
  'Ana García', 'Carlos Rodríguez', 'María López', 'José Martínez', 'Laura Sánchez',
  'Miguel González', 'Carmen Pérez', 'Antonio Ruiz', 'Isabel Torres', 'Francisco Díaz',
  'Elena Moreno', 'Roberto Jiménez', 'Patricia Herrera', 'Fernando Ramos', 'Sofía Castro',
  'Diego Morales', 'Valentina Vega', 'Sebastián Herrera', 'Camila Rojas', 'Nicolás Silva'
];

function generarFechaAleatoria() {
  const inicio = new Date('2024-01-01');
  const fin = new Date();
  const fecha = new Date(inicio.getTime() + Math.random() * (fin.getTime() - inicio.getTime()));
  return fecha.toISOString().split('T')[0];
}

function generarObservaciones() {
  const observaciones = [
    'Sesión muy productiva, el mentee mostró gran interés.',
    'Se identificaron áreas de mejora específicas.',
    'Excelente progreso en los objetivos planteados.',
    'Se requiere seguimiento adicional en próximas sesiones.',
    'El mentee demostró buena receptividad a los consejos.',
    'Sesión enfocada en desarrollo de habilidades blandas.',
    'Se establecieron metas claras para el próximo mes.',
    'Conversación fluida y constructiva.',
    'Se abordaron temas de liderazgo y comunicación.',
    'Sesión de seguimiento con resultados positivos.'
  ];
  return observaciones[Math.floor(Math.random() * observaciones.length)];
}

function generarMotivosAleatorios() {
  const cantidad = Math.floor(Math.random() * 3) + 1; // 1-3 motivos
  const motivosSeleccionados = [];
  const motivosDisponibles = [...motivosConsulta];
  
  for (let i = 0; i < cantidad; i++) {
    const indice = Math.floor(Math.random() * motivosDisponibles.length);
    motivosSeleccionados.push(motivosDisponibles[indice]);
    motivosDisponibles.splice(indice, 1); // Evitar duplicados
  }
  
  return motivosSeleccionados;
}

function generarCorreoMentor(nombreMentor) {
  const timestamp = Date.now();
  const nombreLimpio = nombreMentor.toLowerCase().replace(/\s+/g, '.');
  return `${nombreLimpio}.${timestamp}@temp-nadro.com`;
}

async function insertarConsulta(consulta) {
  const params = {
    TableName: 'NadroMentoria-Consultas',
    Item: {
      'id': { S: consulta.id },
      'nombreMentor': { S: consulta.nombreMentor },
      'correoMentor': { S: consulta.correoMentor },
      'fecha': { S: consulta.fecha },
      'rangoEdad': { S: consulta.rangoEdad },
      'sexo': { S: consulta.sexo },
      'numeroSesion': { N: consulta.numeroSesion.toString() },
      'lugarTrabajo': { S: consulta.lugarTrabajo },
      'area': { S: consulta.area },
      'lugarConsulta': { S: consulta.lugarConsulta },
      'motivosConsulta': { SS: consulta.motivosConsulta },
      'observaciones': { S: consulta.observaciones },
      'createdAt': { S: new Date().toISOString() }
    }
  };

  try {
    await dynamodb.putItem(params).promise();
    console.log(`✅ Insertado: ${consulta.nombreMentor} - Sesión ${consulta.numeroSesion}`);
  } catch (error) {
    console.error(`❌ Error insertando ${consulta.id}:`, error.message);
  }
}

async function generarDatosPrueba(cantidad = 500) {
  console.log(`🚀 Generando ${cantidad} registros de prueba...`);
  
  const consultas = [];
  
  for (let i = 0; i < cantidad; i++) {
    const nombreMentor = nombresMentores[Math.floor(Math.random() * nombresMentores.length)];
    const correoMentor = generarCorreoMentor(nombreMentor);
    
    const consulta = {
      id: `test-${Date.now()}-${i}`,
      nombreMentor: nombreMentor,
      correoMentor: correoMentor,
      fecha: generarFechaAleatoria(),
      rangoEdad: rangosEdad[Math.floor(Math.random() * rangosEdad.length)],
      sexo: sexos[Math.floor(Math.random() * sexos.length)],
      numeroSesion: Math.floor(Math.random() * 10) + 1, // 1-10 sesiones
      lugarTrabajo: lugaresTrabajo[Math.floor(Math.random() * lugaresTrabajo.length)],
      area: areas[Math.floor(Math.random() * areas.length)],
      lugarConsulta: lugaresConsulta[Math.floor(Math.random() * lugaresConsulta.length)],
      motivosConsulta: generarMotivosAleatorios(),
      observaciones: generarObservaciones()
    };
    
    consultas.push(consulta);
  }
  
  console.log(`📊 Datos generados. Insertando en DynamoDB...`);
  
  // Insertar en lotes de 25 (límite de DynamoDB)
  const lotes = [];
  for (let i = 0; i < consultas.length; i += 25) {
    lotes.push(consultas.slice(i, i + 25));
  }
  
  let insertados = 0;
  for (const lote of lotes) {
    const promesas = lote.map(consulta => insertarConsulta(consulta));
    await Promise.all(promesas);
    insertados += lote.length;
    console.log(`📈 Progreso: ${insertados}/${cantidad} registros insertados`);
    
    // Pequeña pausa para no sobrecargar DynamoDB
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`🎉 ¡Completado! Se insertaron ${insertados} registros de prueba.`);
  console.log(`📋 Resumen de datos generados:`);
  console.log(`   - Rangos de edad: ${rangosEdad.join(', ')}`);
  console.log(`   - Sexos: ${sexos.join(', ')}`);
  console.log(`   - Número de sesiones: 1-10`);
  console.log(`   - Motivos de consulta: ${motivosConsulta.length} opciones`);
  console.log(`   - Áreas: ${areas.length} opciones`);
  console.log(`   - Lugares de trabajo: ${lugaresTrabajo.length} opciones`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generarDatosPrueba(500)
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { generarDatosPrueba };