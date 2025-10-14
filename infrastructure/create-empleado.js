const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const readline = require('readline');

// Configurar AWS
AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createEmpleado = async () => {
  try {
    console.log('\n🔹 Crear nuevo empleado/mentor\n');
    
    const nombre = await question('Nombre completo: ');
    const email = await question('Email: ');
    const password = await question('Contraseña: ');
    
    if (!nombre || !email || !password) {
      console.log('❌ Todos los campos son requeridos');
      rl.close();
      return;
    }

    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = {
      id,
      email: email.trim().toLowerCase(),
      nombre: nombre.trim(),
      password: hashedPassword,
      rol: 'empleado',
      createdAt: new Date().toISOString(),
    };

    const params = {
      TableName: 'NadroMentoria-Usuarios',
      Item: usuario,
    };

    await dynamodb.put(params).promise();
    
    console.log('\n✅ Empleado creado exitosamente');
    console.log(`   Nombre: ${usuario.nombre}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Rol: empleado (solo formulario)`);
    console.log('\n📝 El empleado puede hacer login en:');
    console.log('   http://nadro-mentoria-frontend-2024.s3-website-us-east-1.amazonaws.com');
    
  } catch (error) {
    console.error('❌ Error al crear empleado:', error.message);
  } finally {
    rl.close();
  }
};

createEmpleado();



