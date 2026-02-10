const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const cognito = new AWS.CognitoIdentityServiceProvider();

const OLD_USER_POOL_ID = 'us-east-1_CDukBAzcj';  // dev-jul (viejo)
const NEW_USER_POOL_ID = 'us-east-1_wpfxAcVpZ';  // dev (nuevo)

// Contraseña temporal que los usuarios deberán cambiar
const TEMP_PASSWORD = 'TempPass123!';

async function getUserGroups(userPoolId, username) {
  try {
    const response = await cognito.adminListGroupsForUser({
      UserPoolId: userPoolId,
      Username: username
    }).promise();
    return response.Groups.map(g => g.GroupName);
  } catch (error) {
    console.log(`  ℹ️  Usuario ${username} no tiene grupos asignados`);
    return [];
  }
}

async function migrateUsers() {
  console.log('🔄 Iniciando migración de usuarios de Cognito...\n');
  console.log(`  Origen: ${OLD_USER_POOL_ID} (dev-jul)`);
  console.log(`  Destino: ${NEW_USER_POOL_ID} (dev)\n`);
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // Obtener usuarios del User Pool viejo
    console.log('📋 Obteniendo usuarios del User Pool viejo...');
    const oldUsers = await cognito.listUsers({
      UserPoolId: OLD_USER_POOL_ID
    }).promise();

    console.log(`✅ Encontrados ${oldUsers.Users.length} usuarios\n`);

    for (const user of oldUsers.Users) {
      const email = user.Attributes.find(attr => attr.Name === 'email')?.Value;
      const name = user.Attributes.find(attr => attr.Name === 'name')?.Value;
      const emailVerified = user.Attributes.find(attr => attr.Name === 'email_verified')?.Value === 'true';
      
      console.log(`\n👤 Migrando usuario: ${email}`);
      console.log(`   Nombre: ${name}`);
      console.log(`   Estado: ${user.UserStatus}`);
      console.log(`   Email verificado: ${emailVerified ? 'Sí' : 'No'}`);

      try {
        // Crear usuario en el nuevo User Pool
        const createParams = {
          UserPoolId: NEW_USER_POOL_ID,
          Username: email,
          UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'email_verified', Value: 'true' },
            { Name: 'name', Value: name || email.split('@')[0] }
          ],
          TemporaryPassword: TEMP_PASSWORD,
          MessageAction: 'SUPPRESS' // No enviar email de bienvenida
        };

        await cognito.adminCreateUser(createParams).promise();
        console.log('   ✅ Usuario creado en nuevo User Pool');

        // Si estaba confirmado, establecer password permanente
        if (user.UserStatus === 'CONFIRMED') {
          await cognito.adminSetUserPassword({
            UserPoolId: NEW_USER_POOL_ID,
            Username: email,
            Password: TEMP_PASSWORD,
            Permanent: false  // Forzar cambio de contraseña en primer login
          }).promise();
          console.log('   ✅ Contraseña temporal establecida');
        }

        // Obtener y migrar grupos
        const groups = await getUserGroups(OLD_USER_POOL_ID, user.Username);
        console.log(`   📁 Grupos: ${groups.length > 0 ? groups.join(', ') : 'ninguno'}`);
        
        for (const groupName of groups) {
          await cognito.adminAddUserToGroup({
            UserPoolId: NEW_USER_POOL_ID,
            Username: email,
            GroupName: groupName
          }).promise();
          console.log(`   ✅ Agregado al grupo: ${groupName}`);
        }

        console.log(`   ✅ ¡Usuario ${email} migrado exitosamente!`);

      } catch (error) {
        if (error.code === 'UsernameExistsException') {
          console.log(`   ⚠️  Usuario ${email} ya existe en el nuevo User Pool`);
        } else {
          console.error(`   ❌ Error migrando ${email}:`, error.message);
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🎉 ¡Migración completada!\n');
    console.log('📝 Notas importantes:');
    console.log(`   - Contraseña temporal: ${TEMP_PASSWORD}`);
    console.log('   - Los usuarios deberán cambiar su contraseña en el primer login');
    console.log('   - Todos los usuarios fueron verificados automáticamente');
    console.log('   - Los grupos (admin/mentor) fueron preservados\n');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

migrateUsers();
