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
const motivosEntrevistaOpciones = ['Personal', 'Laboral', 'Familiar', 'Salud', 'Económico', 'Otro'];
const lugaresEntrevista = ['Consultorio', 'Oficina', 'Virtual', 'Sala de juntas'];

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

// Generar Entrevistas/Consultas CON ESTRUCTURA CORRECTA
async function seedEntrevistas(count = 100) {
  console.log(`\n📝 Generando ${count} entrevistas/consultas con estructura correcta...\n`);
  
  for (let i = 0; i < count; i++) {
    const fecha = randomDate();
    const data = {
      id: uuidv4(),
      entrevistadores: randomItems(mentores, 1, 2), // Campo correcto
      fecha: fecha.split('T')[0],
      rangoEdad: randomItem(rangosEdad),
      sexo: randomItem(sexos),
      numeroSesion: Math.floor(Math.random() * 10) + 1, // 1-10 sesiones
      haMejorado: Math.random() > 0.5 ? 'Sí' : 'No',
      lugarTrabajo: randomItem(lugares),
      area: randomItem(areas),
      lugarEntrevista: randomItem(lugaresEntrevista),
      motivosEntrevista: randomItems(motivosEntrevistaOpciones, 1, 3), // Array
      observaciones: `Sesión ${i + 1}. ${randomItem(['Persona receptiva y colaborativa', 'Mostró interés en seguimiento', 'Requiere apoyo adicional', 'Avance significativo', 'Situación estable'])}`,
      createdAt: fecha,
      updatedAt: fecha
    };
    
    // 50% consultas, 50% entrevistas
    const table = Math.random() > 0.5 ? 'NadroMentoria-Consultas' : 'NadroMentoria-Entrevistas';
    await dynamodb.put({
      TableName: `${table}-${STAGE}`,
      Item: data
    }).promise();
    
    if ((i + 1) % 10 === 0) {
      console.log(`  ✅ ${i + 1}/${count} registros creados`);
    }
  }
  console.log(`\n✅ ${count} entrevistas/consultas creadas exitosamente`);
}

// Ejecutar
async function main() {
  console.log('🌱 Generando entrevistas/consultas con estructura correcta...');
  console.log('═══════════════════════════════════════════════════════════');
  
  try {
    await seedEntrevistas(100);
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🎉 ¡Datos generados exitosamente!');
    console.log('\n📊 Estructura correcta:');
    console.log('  ✅ entrevistadores (array) - NO mentores');
    console.log('  ✅ numeroSesion (number 1-10)');
    console.log('  ✅ motivosEntrevista (array) - NO motivoConsulta');
    console.log('  ✅ lugarEntrevista (string)');
    console.log('  ✅ haMejorado (Sí/No)');
    console.log('\n✅ Las gráficas del dashboard ahora mostrarán datos correctos');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
