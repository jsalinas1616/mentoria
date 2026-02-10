const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

const STAGE = 'dev';

async function cleanCapacitaciones() {
  console.log(`\n🧹 Limpiando tabla: NadroMentoria-Capacitaciones-${STAGE}...`);
  
  try {
    const scanResult = await dynamodb.scan({
      TableName: `NadroMentoria-Capacitaciones-${STAGE}`
    }).promise();

    console.log(`   Encontrados ${scanResult.Items.length} registros`);

    for (const item of scanResult.Items) {
      await dynamodb.delete({
        TableName: `NadroMentoria-Capacitaciones-${STAGE}`,
        Key: { id: item.id }
      }).promise();
    }

    console.log(`   ✅ Tabla limpiada`);
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
  }
}

cleanCapacitaciones();
