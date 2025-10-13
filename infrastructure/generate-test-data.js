const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configurar AWS
AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Datos de prueba
const nombresMentores = [
  'Juan Carlos Pérez', 'María Elena González', 'Roberto Silva', 'Ana Lucía Martínez',
  'Carlos Alberto Ruiz', 'Patricia Fernández', 'Miguel Ángel López', 'Carmen Rosa Vega',
  'Diego Alejandro Torres', 'Sofía Isabel Morales', 'Andrés Felipe Castro', 'Valentina Esperanza'
];

const nombresMentees = [
  'Luis Fernando Ramírez', 'Diana Carolina Herrera', 'Jorge Eduardo Mendoza', 'Laura Beatriz Jiménez',
  'Ricardo Antonio Vargas', 'Mónica Patricia Sánchez', 'Fernando José Rojas', 'Claudia Marcela Peña',
  'Alejandro David Moreno', 'Natalia Esperanza Guzmán', 'Sebastián Andrés Ospina', 'Camila Alejandra Restrepo'
];

const correosMentores = [
  'juan.perez@nadro.com', 'maria.gonzalez@nadro.com', 'roberto.silva@nadro.com', 'ana.martinez@nadro.com',
  'carlos.ruiz@nadro.com', 'patricia.fernandez@nadro.com', 'miguel.lopez@nadro.com', 'carmen.vega@nadro.com',
  'diego.torres@nadro.com', 'sofia.morales@nadro.com', 'andres.castro@nadro.com', 'valentina.esperanza@nadro.com'
];

const correosMentees = [
  'luis.ramirez@nadro.com', 'diana.herrera@nadro.com', 'jorge.mendoza@nadro.com', 'laura.jimenez@nadro.com',
  'ricardo.vargas@nadro.com', 'monica.sanchez@nadro.com', 'fernando.rojas@nadro.com', 'claudia.pena@nadro.com',
  'alejandro.moreno@nadro.com', 'natalia.guzman@nadro.com', 'sebastian.ospina@nadro.com', 'camila.restrepo@nadro.com'
];

const lugaresTrabajo = [
  'CDR SUCURSAL MÉXICO SUR', 'CORPORATIVO', 'CDR SUCURSAL NORTE', 'PLANTA INDUSTRIAL',
  'CENTRO DE DISTRIBUCIÓN', 'OFICINAS ADMINISTRATIVAS', 'SUCURSAL CENTRO', 'ALMACÉN PRINCIPAL'
];

const areas = [
  'Almacén Diurno', 'Almacén Nocturno', 'Recursos Humanos', 'Contabilidad',
  'Ventas', 'Marketing', 'Operaciones', 'Logística', 'Calidad', 'Seguridad'
];

const lugaresConsulta = [
  'Lugar de trabajo', 'Oficina privada', 'Sala de juntas', 'Área común',
  'Consultorio', 'Espacio abierto', 'Remoto', 'Presencial'
];

const motivosConsulta = [
  'Ansiedad', 'Estrés', 'Relación de pareja', 'Identidad de género', 'Enojo',
  'Finanzas', 'Familia', 'Restructura de rutas', 'Liquidaciones lentas', 'Cumpleaños',
  'Duelo', 'Seguridad en carretera', 'Alcoholismo', 'Depresión', 'Motivación laboral'
];

const observaciones = [
  'Consulta inicial de seguimiento', 'Seguimiento mensual', 'Consulta urgente',
  'Sesión de apoyo emocional', 'Consulta de orientación', 'Seguimiento post-tratamiento',
  'Consulta de emergencia', 'Sesión regular', 'Consulta de evaluación', 'Seguimiento personalizado'
];

// Función para generar fecha aleatoria en los últimos 6 meses
function generarFechaAleatoria() {
  const ahora = new Date();
  const hace6Meses = new Date();
  hace6Meses.setMonth(ahora.getMonth() - 6);
  
  const tiempoAleatorio = Math.random() * (ahora.getTime() - hace6Meses.getTime());
  const fechaAleatoria = new Date(hace6Meses.getTime() + tiempoAleatorio);
  
  return fechaAleatoria.toISOString().split('T')[0];
}

// Función para seleccionar elementos aleatorios
function seleccionarAleatorio(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function seleccionarMultiples(array, min = 1, max = 3) {
  const cantidad = Math.floor(Math.random() * (max - min + 1)) + min;
  const resultado = [];
  const copia = [...array];
  
  for (let i = 0; i < cantidad && copia.length > 0; i++) {
    const indice = Math.floor(Math.random() * copia.length);
    resultado.push(copia.splice(indice, 1)[0]);
  }
  
  return resultado;
}

// Función para generar una consulta aleatoria
function generarConsulta() {
  const id = uuidv4();
  const timestamp = new Date().toISOString();
  
  return {
    id,
    nombreMentor: seleccionarAleatorio(nombresMentores),
    correoMentor: seleccionarAleatorio(correosMentores),
    nombreMentee: seleccionarAleatorio(nombresMentees),
    correoMentee: seleccionarAleatorio(correosMentees),
    fecha: generarFechaAleatoria(),
    lugarTrabajo: seleccionarAleatorio(lugaresTrabajo),
    area: seleccionarAleatorio(areas),
    lugarConsulta: seleccionarAleatorio(lugaresConsulta),
    motivosConsulta: seleccionarMultiples(motivosConsulta, 1, 4),
    observaciones: seleccionarAleatorio(observaciones),
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

// Función principal
async function generarDatosPrueba(cantidad = 50) {
  console.log(`🚀 Generando ${cantidad} consultas de prueba...`);
  
  const consultas = [];
  
  for (let i = 0; i < cantidad; i++) {
    consultas.push(generarConsulta());
  }
  
  console.log('📝 Consultas generadas, insertando en DynamoDB...');
  
  let exitosas = 0;
  let errores = 0;
  
  for (const consulta of consultas) {
    try {
      const params = {
        TableName: 'NadroMentoria-Consultas',
        Item: consulta
      };
      
      await dynamodb.put(params).promise();
      exitosas++;
      
      if (exitosas % 10 === 0) {
        console.log(`✅ ${exitosas} consultas insertadas...`);
      }
    } catch (error) {
      console.error(`❌ Error insertando consulta ${consulta.id}:`, error.message);
      errores++;
    }
  }
  
  console.log('\n🎉 Proceso completado!');
  console.log(`✅ Consultas exitosas: ${exitosas}`);
  console.log(`❌ Errores: ${errores}`);
  console.log(`📊 Total: ${exitosas + errores}`);
  
  if (exitosas > 0) {
    console.log('\n🌐 Ahora puedes verificar el dashboard en:');
    console.log('   Local: http://localhost:3000/index.html#/admin/dashboard');
    console.log('   Producción: https://nadro-mentoria-frontend-1760378806.s3.us-east-1.amazonaws.com/index.html#/admin/dashboard');
  }
}

// Ejecutar
const cantidad = process.argv[2] ? parseInt(process.argv[2]) : 50;
generarDatosPrueba(cantidad).catch(console.error);
