const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Configurar AWS
AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

const empleadosPrueba = [
  {
    nombre: 'Juan Pérez Empleado',
    email: 'empleado1@nadro.com',
    password: 'empleado123'
  },
  {
    nombre: 'María González Mentor',
    email: 'empleado2@nadro.com',
    password: 'empleado123'
  },
  {
    nombre: 'Carlos López Trabajador',
    email: 'empleado3@nadro.com',
    password: 'empleado123'
  }
];

const createEmpleados = async () => {
  console.log('🔹 Creando empleados de prueba...\n');
  
  for (const emp of empleadosPrueba) {
    try {
      const id = uuidv4();
      const hashedPassword = await bcrypt.hash(emp.password, 10);

      const usuario = {
        id,
        email: emp.email,
        nombre: emp.nombre,
        password: hashedPassword,
        rol: 'empleado',
        createdAt: new Date().toISOString(),
      };

      const params = {
        TableName: 'NadroMentoria-Usuarios',
        Item: usuario,
      };

      await dynamodb.put(params).promise();
      console.log(`✅ ${emp.nombre}`);
      console.log(`   Email: ${emp.email}`);
      console.log(`   Password: ${emp.password}`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error al crear ${emp.nombre}:`, error.message);
    }
  }
  
  console.log('\n✅ Empleados de prueba creados');
  console.log('\n📝 Todos pueden hacer login con password: empleado123');
  console.log('   URL: http://nadro-mentoria-frontend-2024.s3-website-us-east-1.amazonaws.com');
};

createEmpleados();




