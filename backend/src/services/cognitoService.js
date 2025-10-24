const AWS = require('aws-sdk');
const { COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } = process.env;

const cognito = new AWS.CognitoIdentityServiceProvider();

class CognitoService {
  /**
   * Obtener información del usuario desde Cognito
   */
  async getUserInfo(username) {
    try {
      const params = {
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username,
      };

      const user = await cognito.adminGetUser(params).promise();
      
      // Extraer atributos
      const attributes = {};
      user.UserAttributes.forEach(attr => {
        attributes[attr.Name] = attr.Value;
      });

      return {
        username: user.Username,
        email: attributes.email,
        name: attributes.name,
        enabled: user.Enabled,
        status: user.UserStatus,
      };
    } catch (error) {
      console.error('Error obteniendo usuario de Cognito:', error);
      throw error;
    }
  }

  /**
   * Obtener grupos (roles) del usuario
   */
  async getUserGroups(username) {
    try {
      const params = {
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username,
      };

      const result = await cognito.adminListGroupsForUser(params).promise();
      return result.Groups.map(group => group.GroupName);
    } catch (error) {
      console.error('Error obteniendo grupos del usuario:', error);
      throw error;
    }
  }

  /**
   * Agregar usuario a un grupo (rol)
   */
  async addUserToGroup(username, groupName) {
    try {
      const params = {
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username,
        GroupName: groupName,
      };

      await cognito.adminAddUserToGroup(params).promise();
      return { success: true, message: `Usuario agregado al grupo ${groupName}` };
    } catch (error) {
      console.error('Error agregando usuario al grupo:', error);
      throw error;
    }
  }

  /**
   * Remover usuario de un grupo (rol)
   */
  async removeUserFromGroup(username, groupName) {
    try {
      const params = {
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username,
        GroupName: groupName,
      };

      await cognito.adminRemoveUserFromGroup(params).promise();
      return { success: true, message: `Usuario removido del grupo ${groupName}` };
    } catch (error) {
      console.error('Error removiendo usuario del grupo:', error);
      throw error;
    }
  }

  /**
   * Crear usuario en Cognito con rol
   * Roles válidos: 'admin' o 'mentor' (por defecto: mentor)
   */
  async createUser(email, name, temporaryPassword, role = 'mentor') {
    try {
      const params = {
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'name', Value: name },
          { Name: 'email_verified', Value: 'true' },
        ],
        TemporaryPassword: temporaryPassword,
        MessageAction: 'SUPPRESS', // No enviar email automático
      };

      const user = await cognito.adminCreateUser(params).promise();
      
      // Agregar al grupo correspondiente
      await this.addUserToGroup(email, role);

      return {
        username: user.User.Username,
        email,
        name,
        role,
      };
    } catch (error) {
      console.error('Error creando usuario en Cognito:', error);
      throw error;
    }
  }

  /**
   * Actualizar atributos del usuario
   */
  async updateUserAttributes(username, attributes) {
    try {
      const userAttributes = Object.keys(attributes).map(key => ({
        Name: key,
        Value: attributes[key],
      }));

      const params = {
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username,
        UserAttributes: userAttributes,
      };

      await cognito.adminUpdateUserAttributes(params).promise();
      return { success: true, message: 'Atributos actualizados' };
    } catch (error) {
      console.error('Error actualizando atributos:', error);
      throw error;
    }
  }

  /**
   * Deshabilitar usuario
   */
  async disableUser(username) {
    try {
      const params = {
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username,
      };

      await cognito.adminDisableUser(params).promise();
      return { success: true, message: 'Usuario deshabilitado' };
    } catch (error) {
      console.error('Error deshabilitando usuario:', error);
      throw error;
    }
  }

  /**
   * Habilitar usuario
   */
  async enableUser(username) {
    try {
      const params = {
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username,
      };

      await cognito.adminEnableUser(params).promise();
      return { success: true, message: 'Usuario habilitado' };
    } catch (error) {
      console.error('Error habilitando usuario:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña del usuario (forzado por admin)
   */
  async setUserPassword(username, password, permanent = true) {
    try {
      const params = {
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username,
        Password: password,
        Permanent: permanent,
      };

      await cognito.adminSetUserPassword(params).promise();
      return { success: true, message: 'Contraseña actualizada' };
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      throw error;
    }
  }

  /**
   * Listar todos los usuarios del pool
   */
  async listUsers(limit = 60) {
    try {
      const params = {
        UserPoolId: COGNITO_USER_POOL_ID,
        Limit: limit,
      };

      const result = await cognito.listUsers(params).promise();
      
      return result.Users.map(user => {
        const attributes = {};
        user.Attributes.forEach(attr => {
          attributes[attr.Name] = attr.Value;
        });

        return {
          username: user.Username,
          email: attributes.email,
          name: attributes.name,
          enabled: user.Enabled,
          status: user.UserStatus,
          createdAt: user.UserCreateDate,
        };
      });
    } catch (error) {
      console.error('Error listando usuarios:', error);
      throw error;
    }
  }
}

module.exports = new CognitoService();
