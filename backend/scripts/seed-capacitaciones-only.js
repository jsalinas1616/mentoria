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

// Generar Capacitaciones CON ESTRUCTURA CORRECTA
async function seedCapacitaciones(count = 100) {
  console.log(`\n👥 Generando ${count} capacitaciones con estructura correcta...\n`);
  
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
    
    // Simular que se invitaron más personas de las que asistieron
    const numInvitados = numAsistentes + Math.floor(Math.random() * 5); // 0-4 personas más invitadas
    
    const data = {
      id: uuidv4(),
      capacitadores: randomItems(mentores, 1, 2),
      fecha: fecha.split('T')[0],
      tema: randomItem(temas),
      lugar: randomItem(lugares),
      numeroPersonasInvitadas: numInvitados, // Campo que faltaba
      asistentes: asistentes,
      numeroMentoriasAgendadas: 0, // Campo opcional
      observaciones: `Capacitación exitosa con ${numAsistentes} participantes. ${randomItem(['Excelente participación', 'Buena retroalimentación', 'Grupo muy receptivo', 'Interés demostrado', 'Sesión productiva'])}`,
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
  console.log(`\n✅ ${count} capacitaciones creadas exitosamente`);
}

// Ejecutar
async function main() {
  console.log('🌱 Generando capacitaciones con estructura correcta...');
  console.log('═══════════════════════════════════════════════════════════');
  
  try {
    await seedCapacitaciones(100);
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🎉 ¡Capacitaciones generadas exitosamente!');
    console.log('\n📊 Estructura correcta:');
    console.log('  ✅ lugar (string) - NO cdr');
    console.log('  ✅ capacitadores (array)');
    console.log('  ✅ tema (string)');
    console.log('  ✅ asistentes (array con rangoEdad, sexo, lugarTrabajo, area)');
    console.log('  ✅ 5-20 asistentes por capacitación');
    console.log('\n✅ El dashboard de Capacitaciones ahora mostrará datos correctos');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
