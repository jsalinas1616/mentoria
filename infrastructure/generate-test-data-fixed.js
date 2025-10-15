const AWS = require('aws-sdk');

// Configurar AWS
AWS.config.update({
  region: 'us-east-1'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Datos de prueba más realistas
const motivosConsulta = [
  'Alcoholismo',
  'Ansiedad',
  'Depresión',
  'Estrés laboral',
  'Problemas familiares',
  'Duelo',
  'Adicciones',
  'Violencia doméstica',
  'Problemas de pareja',
  'Crisis existencial',
  'Burnout',
  'Problemas financieros',
  'Autoestima',
  'Comunicación',
  'Liderazgo',
  'Productividad',
  'Equilibrio trabajo-vida',
  'Desarrollo profesional',
  'Toma de decisiones',
  'Manejo de conflictos'
];

const lugaresTrabajo = [
  'Oficina Central',
  'Planta Industrial',
  'Sucursal Norte',
  'Sucursal Sur',
  'Centro de Distribución',
  'Oficina Regional',
  'Planta de Producción',
  'Centro de Servicios',
  'Oficina Corporativa',
  'Sede Principal'
];

const areas = [
  'Recursos Humanos',
  'Producción',
  'Ventas',
  'Marketing',
  'Finanzas',
  'Operaciones',
  'Tecnología',
  'Logística',
  'Calidad',
  'Administración'
];

const rangosEdad = [
  '18-25',
  '26-35',
  '36-45',
  '46-55',
  '56-65',
  '66-75',
  '76-80',
  '80+'
];

const sexos = ['Hombre', 'Mujer'];

const nombresMentores = [
  'Dr. Carlos Mendoza',
  'Dra. Ana García',
  'Lic. Roberto Silva',
  'Psic. María López',
  'Dr. José Martínez',
  'Dra. Carmen Ruiz',
  'Lic. Fernando Torres',
  'Psic. Laura Vargas',
  'Dr. Miguel Herrera',
  'Dra. Patricia Morales'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * count) + 1);
}

function generateRandomDate() {
  const start = new Date(2024, 0, 1); // 1 enero 2024
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function generateTestData() {
  console.log('Generando datos de prueba...');
  
  const batchSize = 25; // DynamoDB permite máximo 25 items por batch
  const totalRecords = 500;
  
  for (let i = 0; i < totalRecords; i += batchSize) {
    const batch = [];
    const currentBatchSize = Math.min(batchSize, totalRecords - i);
    
    for (let j = 0; j < currentBatchSize; j++) {
      const recordIndex = i + j;
      const fecha = generateRandomDate();
      
      // Generar múltiples motivos de consulta (1-3 motivos por consulta)
      const motivos = getRandomElements(motivosConsulta, 3);
      
      const item = {
        id: `consulta-${Date.now()}-${recordIndex}`,
        nombreMentor: getRandomElement(nombresMentores),
        correoMentor: `mentor${recordIndex}@nadro.com`,
        fecha: fecha.toISOString().split('T')[0],
        lugarTrabajo: getRandomElement(lugaresTrabajo),
        area: getRandomElement(areas),
        motivosConsulta: motivos, // Array de strings
        rangoEdad: getRandomElement(rangosEdad),
        sexo: getRandomElement(sexos),
        numeroSesion: Math.floor(Math.random() * 20) + 1,
        createdAt: fecha.toISOString(),
        updatedAt: fecha.toISOString()
      };
      
      batch.push({
        PutRequest: {
          Item: item
        }
      });
    }
    
    const params = {
      RequestItems: {
        'nadro-mentoria-consultas': batch
      }
    };
    
    try {
      await dynamodb.batchWrite(params).promise();
      console.log(`Insertados ${currentBatchSize} registros (${i + currentBatchSize}/${totalRecords})`);
    } catch (error) {
      console.error('Error insertando batch:', error);
    }
  }
  
  console.log('✅ Datos de prueba generados exitosamente');
}

// Ejecutar
generateTestData().catch(console.error);
