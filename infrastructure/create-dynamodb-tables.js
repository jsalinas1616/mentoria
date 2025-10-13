const AWS = require('aws-sdk');

// Configurar AWS
AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB();

// Definir tablas
const tables = [
  {
    TableName: 'NadroMentoria-Consultas',
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'NadroMentoria-Usuarios',
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
];

// Función para crear tablas
async function createTables() {
  for (const table of tables) {
    try {
      console.log(`Creando tabla ${table.TableName}...`);
      await dynamodb.createTable(table).promise();
      console.log(`✅ Tabla ${table.TableName} creada exitosamente`);
    } catch (error) {
      if (error.code === 'ResourceInUseException') {
        console.log(`⚠️  Tabla ${table.TableName} ya existe`);
      } else {
        console.error(`❌ Error al crear tabla ${table.TableName}:`, error.message);
      }
    }
  }
}

// Ejecutar
createTables().then(() => {
  console.log('\n✅ Proceso completado');
}).catch(error => {
  console.error('❌ Error:', error);
});


