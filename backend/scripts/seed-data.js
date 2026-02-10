const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

const STAGE = 'dev';

// Datos realistas
const mentores = ['Ana García', 'Carlos Rodríguez', 'María López', 'Juan Martínez', 'Laura Sánchez', 'Pedro Ramírez', 'Sofia Torres', 'Miguel Ángel'];
const lugares = ['Planta Bajío', 'Planta Puebla', 'Planta Toluca', 'Oficinas CDMX', 'Planta Querétaro'];
const areas = ['Producción', 'Calidad', 'Mantenimiento', 'Recursos Humanos', 'Logística', 'Finanzas', 'Ventas'];
const rangosEdad = ['18-25', '26-35', '36-45', '46-55', '56+'];
const sexos = ['Hombre', 'Mujer', 'Diversidad'];
const estadosAnimo = ['Feliz', 'Triste', 'Ansioso', 'Enojado', 'Motivado', 'Cansado', 'Agradecido', 'Frustrado', 'Esperanzado', 'Abrumado', 'Tranquilo', 'Confundido', 'Inspirado', 'Preocupado'];
const lugaresAcercamiento = ['Área de trabajo', 'Cafetería', 'Sala de descanso', 'Pasillo', 'Estacionamiento'];
const lugaresVisita = ['Domicilio', 'Hospital', 'Reclusorio', 'Funeral'];
const parentescos = ['Madre', 'Padre', 'Hijos', 'Pareja', 'Otro'];
const cdrLocations = ['Bajío', 'Puebla', 'Toluca', 'Querétaro', 'CDMX'];
const temas = [
  'Manejo del estrés laboral',
  'Comunicación efectiva',
  'Trabajo en equipo',
  'Liderazgo',
  'Inteligencia emocional',
  'Balance vida-trabajo',
  'Resolución de conflictos',
  'Motivación personal'
];

// Generar fecha aleatoria en los últimos 6 meses
function randomDate(monthsBack = 6) {
  const now = new Date();
  const start = new Date(now.getTime() - (monthsBack * 30 * 24 * 60 * 60 * 1000));
  const randomTime = start.getTime() + Math.random() * (now.getTime() - start.getTime());
  return new Date(randomTime).toISOString();
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomItems(array, min = 1, max = 3) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Generar Entrevistas/Consultas
async function seedEntrevistas(count = 100) {
  console.log(`\n📝 Generando ${count} entrevistas/consultas...`);
  const motivosEntrevistaOpciones = ['Personal', 'Laboral', 'Familiar', 'Salud', 'Económico', 'Otro'];
  
  for (let i = 0; i < count; i++) {
    const fecha = randomDate();
    const data = {
      id: uuidv4(),
      entrevistadores: randomItems(mentores, 1, 2), // CORREGIDO: era 'mentores'
      fecha: fecha.split('T')[0],
      rangoEdad: randomItem(rangosEdad),
      sexo: randomItem(sexos),
      numeroSesion: Math.floor(Math.random() * 10) + 1, // AGREGADO: 1-10 sesiones
      haMejorado: Math.random() > 0.5 ? 'Sí' : 'No', // AGREGADO
      lugarTrabajo: randomItem(lugares),
      area: randomItem(areas),
      lugarEntrevista: randomItem(['Consultorio', 'Oficina', 'Virtual']), // CORREGIDO
      motivosEntrevista: randomItems(motivosEntrevistaOpciones, 1, 3), // CORREGIDO: ahora es array
      observaciones: `Observaciones de la sesión ${i + 1}`,
      createdAt: fecha,
      updatedAt: fecha
    };
    
    const table = Math.random() > 0.5 ? 'NadroMentoria-Consultas' : 'NadroMentoria-Entrevistas';
    await dynamodb.put({
      TableName: `${table}-${STAGE}`,
      Item: data
    }).promise();
    
    if ((i + 1) % 10 === 0) {
      console.log(`  ✅ ${i + 1}/${count} entrevistas creadas`);
    }
  }
  console.log(`✅ ${count} entrevistas/consultas creadas exitosamente`);
}

// Generar Capacitaciones
async function seedCapacitaciones(count = 100) {
  console.log(`\n👥 Generando ${count} capacitaciones...`);
  for (let i = 0; i < count; i++) {
    const fecha = randomDate();
    const numAsistentes = Math.floor(Math.random() * 15) + 5; // 5-20 asistentes
    const asistentes = [];
    
    for (let j = 0; j < numAsistentes; j++) {
      asistentes.push({
        rangoEdad: randomItem(rangosEdad),
        sexo: randomItem(sexos),
        lugarTrabajo: randomItem(lugares),
        area: randomItem(areas)
      });
    }
    
    const data = {
      id: uuidv4(),
      capacitadores: randomItems(mentores, 1, 2),
      fecha: fecha.split('T')[0],
      tema: randomItem(temas),
      cdr: randomItem(cdrLocations),
      asistentes: asistentes,
      observaciones: `Capacitación exitosa con ${numAsistentes} participantes`,
      createdAt: fecha,
      updatedAt: fecha
    };
    
    await dynamodb.put({
      TableName: `NadroMentoria-Capacitaciones-${STAGE}`,
      Item: data
    }).promise();
    
    if ((i + 1) % 10 === 0) {
      console.log(`  ✅ ${i + 1}/${count} capacitaciones creadas`);
    }
  }
  console.log(`✅ ${count} capacitaciones creadas exitosamente`);
}

// Generar Acercamientos (Contacto de vida)
async function seedAcercamientos(count = 100) {
  console.log(`\n💚 Generando ${count} contactos de vida...`);
  for (let i = 0; i < count; i++) {
    const fecha = randomDate();
    const data = {
      id: uuidv4(),
      mentores: randomItems(mentores, 1, 2),
      fecha: fecha.split('T')[0],
      rangoEdad: randomItem(rangosEdad),
      sexo: randomItem(sexos),
      numeroAcercamiento: 1,
      haMejorado: '',
      lugarTrabajo: randomItem(lugares),
      area: randomItem(areas),
      lugarAcercamiento: randomItem(lugaresAcercamiento),
      motivosContacto: '',
      seguimiento: 'Seguimiento',
      estadosAnimo: randomItems(estadosAnimo, 1, 4),
      observaciones: `Contacto de vida ${i + 1}. Persona receptiva y agradecida.`,
      createdAt: fecha,
      updatedAt: fecha
    };
    
    await dynamodb.put({
      TableName: `NadroMentoria-Acercamientos-${STAGE}`,
      Item: data
    }).promise();
    
    if ((i + 1) % 10 === 0) {
      console.log(`  ✅ ${i + 1}/${count} contactos creados`);
    }
  }
  console.log(`✅ ${count} contactos de vida creados exitosamente`);
}

// Generar Visitas
async function seedVisitas(count = 100) {
  console.log(`\n🏠 Generando ${count} visitas...`);
  for (let i = 0; i < count; i++) {
    const fecha = randomDate();
    const data = {
      id: uuidv4(),
      mentores: randomItems(mentores, 1, 2),
      fecha: fecha.split('T')[0],
      lugarVisita: randomItem(lugaresVisita),
      rangoEdad: randomItem(rangosEdad),
      sexo: randomItem(sexos),
      parentesco: randomItem(parentescos),
      areaPersonal: randomItem(areas),
      observaciones: `Visita ${i + 1}. Familia agradecida por el apoyo.`,
      createdAt: fecha,
      updatedAt: fecha
    };
    
    await dynamodb.put({
      TableName: `NadroMentoria-Visitas-${STAGE}`,
      Item: data
    }).promise();
    
    if ((i + 1) % 10 === 0) {
      console.log(`  ✅ ${i + 1}/${count} visitas creadas`);
    }
  }
  console.log(`✅ ${count} visitas creadas exitosamente`);
}

// Ejecutar seed
async function main() {
  console.log('🌱 Iniciando seed de datos para DEV...\n');
  console.log('═══════════════════════════════════════════════════════════');
  
  try {
    await seedEntrevistas(100);
    await seedCapacitaciones(100);
    await seedAcercamientos(100);
    await seedVisitas(100);
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🎉 ¡Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log('  - 100 Entrevistas/Consultas');
    console.log('  - 100 Capacitaciones');
    console.log('  - 100 Contactos de vida');
    console.log('  - 100 Visitas');
    console.log('  ─────────────────────────');
    console.log('  TOTAL: 400 registros');
    console.log('\n✅ Las gráficas del dashboard ahora tienen datos para mostrar');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

main();
