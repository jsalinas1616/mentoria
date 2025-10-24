const AWS = require('aws-sdk');
require('dotenv').config({ path: '../backend/.env' });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const USUARIOS_TABLE = process.env.USUARIOS_TABLE || 'NadroMentoria-Usuarios-dev';
const DEFAULT_TEMP_PASSWORD = 'Temporal123!'; // Los usuarios cambiarán esto en el primer login

async function migrateUsers() {
  try {
    console.log('🔄 Iniciando migración de usuarios a Cognito...');
    console.log(`📋 User Pool ID: ${USER_POOL_ID}`);
    console.log(`📋 Tabla: ${USUARIOS_TABLE}\n`);

    if (!USER_POOL_ID) {
      console.error('❌ ERROR: COGNITO_USER_POOL_ID no está configurado');
      console.log('💡 Asegúrate de haber desplegado el backend primero con: npm run deploy');
      process.exit(1);
    }

    // Obtener todos los usuarios de DynamoDB
    const params = {
      TableName: USUARIOS_TABLE,
    };

    const result = await dynamodb.scan(params).promise();
    const usuarios = result.Items || [];

    console.log(`📊 Usuarios encontrados en DynamoDB: ${usuarios.length}\n`);

    if (usuarios.length === 0) {
      console.log('⚠️  No hay usuarios para migrar');
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const usuario of usuarios) {
      try {
        console.log(`\n👤 Procesando usuario: ${usuario.email}`);

        // Crear usuario en Cognito
        const createParams = {
          UserPoolId: USER_POOL_ID,
          Username: usuario.email,
          UserAttributes: [
            { Name: 'email', Value: usuario.email },
            { Name: 'name', Value: usuario.nombre || usuario.email },
            { Name: 'email_verified', Value: 'true' },
          ],
          TemporaryPassword: DEFAULT_TEMP_PASSWORD,
          MessageAction: 'SUPPRESS', // No enviar email
        };

        await cognito.adminCreateUser(createParams).promise();
        console.log(`  ✅ Usuario creado en Cognito`);

        // Agregar al grupo según su rol (por defecto: mentor)
        const rol = usuario.rol || 'mentor';
        const groupParams = {
          UserPoolId: USER_POOL_ID,
          Username: usuario.email,
          GroupName: rol,
        };

        await cognito.adminAddUserToGroup(groupParams).promise();
        console.log(`  ✅ Agregado al grupo: ${rol}`);
        migratedCount++;

      } catch (error) {
        if (error.code === 'UsernameExistsException') {
          console.log(`  ⚠️  Usuario ya existe en Cognito: ${usuario.email}`);
          
          // Verificar y agregar al grupo si no está
          try {
            const rol = usuario.rol || 'mentor';
            await cognito.adminAddUserToGroup({
              UserPoolId: USER_POOL_ID,
              Username: usuario.email,
              GroupName: rol,
            }).promise();
            console.log(`  ✅ Agregado al grupo: ${rol}`);
          } catch (groupError) {
            if (groupError.code === 'UserNotFoundException') {
              console.log(`  ❌ Usuario no encontrado en Cognito`);
              errorCount++;
            } else {
              console.log(`  ℹ️  Ya está en el grupo o error: ${groupError.message}`);
            }
          }
          skippedCount++;
        } else {
          console.error(`  ❌ Error migrando ${usuario.email}:`, error.message);
          errorCount++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migración completada!');
    console.log('='.repeat(60));
    console.log(`📊 Resumen:`);
    console.log(`   - Total usuarios en DynamoDB: ${usuarios.length}`);
    console.log(`   - Migrados exitosamente: ${migratedCount}`);
    console.log(`   - Ya existían (omitidos): ${skippedCount}`);
    console.log(`   - Errores: ${errorCount}`);
    console.log('');
    console.log(`📧 IMPORTANTE:`);
    console.log(`   - Contraseña temporal: ${DEFAULT_TEMP_PASSWORD}`);
    console.log(`   - Los usuarios deberán cambiarla en el primer inicio de sesión`);
    console.log(`   - Notifica a los usuarios sobre su nueva contraseña temporal\n`);

  } catch (error) {
    console.error('\n❌ Error en migración:', error);
    if (error.code === 'ResourceNotFoundException') {
      console.error('💡 Asegúrate de que el User Pool existe y está desplegado');
    }
    process.exit(1);
  }
}

// Ejecutar migración
console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     MIGRACIÓN DE USUARIOS DE DYNAMODB A COGNITO          ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

migrateUsers();

