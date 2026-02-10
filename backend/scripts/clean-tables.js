const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

const STAGE = 'dev';
const TABLES = [
  'NadroMentoria-Consultas',
  'NadroMentoria-Entrevistas'
];

async function cleanTable(tableName) {
  console.log(`\n🧹 Limpiando tabla: ${tableName}-${STAGE}...`);
  
  try {
    // Scan para obtener todos los items
    const scanResult = await dynamodb.scan({
      TableName: `${tableName}-${STAGE}`
    }).promise();

    console.log(`   Encontrados ${scanResult.Items.length} registros`);

    // Borrar cada item
    for (const item of scanResult.Items) {
      await dynamodb.delete({
        TableName: `${tableName}-${STAGE}`,
        Key: { id: item.id }
      }).promise();
    }

    console.log(`   ✅ Tabla ${tableName}-${STAGE} limpiada`);
  } catch (error) {
    console.error(`   ❌ Error limpiando ${tableName}:`, error.message);
  }
}

async function main() {
  console.log('🗑️  Limpiando tablas de Entrevistas y Consultas...\n');
  console.log('═══════════════════════════════════════════════════════════');

  for (const table of TABLES) {
    await cleanTable(table);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ Limpieza completada\n');
}

main();
