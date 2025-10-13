const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Configurar AWS
AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Usuario inicial
const createInitialUser = async () => {
  const id = uuidv4();
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const usuario = {
    id,
    email: 'admin@nadro.com',
    nombre: 'Administrador',
    password: hashedPassword,
    rol: 'admin',
    createdAt: new Date().toISOString(),
  };

  const params = {
    TableName: 'NadroMentoria-Usuarios',
    Item: usuario,
  };

  try {
    await dynamodb.put(params).promise();
    console.log('✅ Usuario inicial creado exitosamente');
    console.log('   Email: admin@nadro.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  IMPORTANTE: Cambia esta contraseña después del primer login');
  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
  }
};

createInitialUser();


