import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';

// Configuración del User Pool
const poolData = {
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || '',
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || '',
};

const userPool = new CognitoUserPool(poolData);

class CognitoAuthService {
  /**
   * Iniciar sesión con Cognito
   */
  login(email, password) {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
          const idToken = session.getIdToken().getJwtToken();
          const accessToken = session.getAccessToken().getJwtToken();
          const refreshToken = session.getRefreshToken().getToken();

          // Obtener información del usuario del token
          const payload = session.getIdToken().payload;
          const groups = payload['cognito:groups'] || [];

          console.log('🔐 Grupos del usuario en Cognito:', groups);

          // Determinar rol principal
          const rol = groups.includes('admin') ? 'admin' : 
                      groups.includes('mentor') ? 'mentor' : null;

          // Validar que el usuario tenga un rol asignado
          if (!rol) {
            reject({
              code: 'NoRoleAssignedException',
              message: 'Tu cuenta no tiene un rol asignado. Contacta al administrador del sistema.',
            });
            return;
          }

          const userData = {
            id: payload.sub,
            email: payload.email,
            username: payload['cognito:username'],
            roles: groups,
            rol: rol,
          };

          // Guardar tokens en localStorage
          localStorage.setItem('idToken', idToken);
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('authToken', idToken); // Para compatibilidad

          console.log('✅ Usuario autenticado con rol:', rol);

          resolve({
            success: true,
            user: userData,
            session,
            tokens: {
              idToken,
              accessToken,
              refreshToken,
            },
          });
        },

        onFailure: (err) => {
          console.error('Error en login:', err);
          reject(err);
        },

        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Usuario debe cambiar contraseña temporal
          // Guardamos el cognitoUser para usarlo después
          resolve({
            success: false,
            challengeName: 'NEW_PASSWORD_REQUIRED',
            userAttributes,
            requiredAttributes,
            cognitoUser,
          });
        },
      });
    });
  }

  /**
   * Completar cambio de contraseña obligatorio
   */
  completeNewPassword(cognitoUser, newPassword, userAttributes = {}) {
    return new Promise((resolve, reject) => {
      // Crear una copia para no mutar el objeto original
      const attributes = { ...userAttributes };
      
      // Guardar el email antes de eliminarlo (lo necesitamos para generar el nombre)
      const userEmail = attributes.email || cognitoUser.username || 'Usuario';
      
      // Si no hay 'name', generarlo desde el email
      if (!attributes.name) {
        attributes.name = userEmail.split('@')[0].replace(/[._]/g, ' ');
      }
      
      // Eliminar solo atributos que no se pueden modificar en el cambio de contraseña
      delete attributes.email_verified;
      delete attributes.email;

      cognitoUser.completeNewPasswordChallenge(newPassword, attributes, {
        onSuccess: (session) => {
          const idToken = session.getIdToken().getJwtToken();
          const accessToken = session.getAccessToken().getJwtToken();
          const payload = session.getIdToken().payload;
          const groups = payload['cognito:groups'] || [];

          console.log('🔐 Grupos del usuario en Cognito:', groups);

          // Determinar rol principal
          const rol = groups.includes('admin') ? 'admin' : 
                      groups.includes('mentor') ? 'mentor' : null;

          // Validar que el usuario tenga un rol asignado
          if (!rol) {
            reject({
              code: 'NoRoleAssignedException',
              message: 'Tu cuenta no tiene un rol asignado. Contacta al administrador del sistema.',
            });
            return;
          }

          const userData = {
            id: payload.sub,
            email: payload.email,
            username: payload['cognito:username'],
            roles: groups,
            rol: rol,
          };

          // Guardar tokens
          localStorage.setItem('idToken', idToken);
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('authToken', idToken);

          console.log('✅ Usuario autenticado con rol:', rol);

          resolve({
            success: true,
            user: userData,
            session,
          });
        },
        onFailure: (err) => {
          console.error('Error al cambiar contraseña:', err);
          reject(err);
        },
      });
    });
  }

  /**
   * Cerrar sesión
   */
  logout() {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }
    
    localStorage.removeItem('idToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    return new Promise((resolve, reject) => {
      const currentUser = userPool.getCurrentUser();

      if (!currentUser) {
        reject(new Error('No hay usuario autenticado'));
        return;
      }

      currentUser.getSession((err, session) => {
        if (err) {
          reject(err);
          return;
        }

        if (!session.isValid()) {
          reject(new Error('Sesión inválida'));
          return;
        }

        const payload = session.getIdToken().payload;
        const groups = payload['cognito:groups'] || [];

        // Determinar rol principal
        const rol = groups.includes('admin') ? 'admin' : 
                    groups.includes('mentor') ? 'mentor' : null;

        // Validar que el usuario tenga un rol asignado
        if (!rol) {
          reject({
            code: 'NoRoleAssignedException',
            message: 'Tu cuenta no tiene un rol asignado. Contacta al administrador del sistema.',
          });
          return;
        }

        resolve({
          id: payload.sub,
          email: payload.email,
          username: payload['cognito:username'],
          roles: groups,
          rol: rol,
        });
      });
    });
  }

  /**
   * Obtener token actual
   */
  getToken() {
    return localStorage.getItem('idToken');
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  /**
   * Recuperar contraseña
   */
  forgotPassword(email) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.forgotPassword({
        onSuccess: (data) => {
          resolve(data);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  /**
   * Confirmar nueva contraseña con código
   */
  confirmPassword(email, verificationCode, newPassword) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmPassword(verificationCode, newPassword, {
        onSuccess: () => {
          resolve({ success: true });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  /**
   * Cambiar contraseña (usuario autenticado)
   */
  changePassword(oldPassword, newPassword) {
    return new Promise((resolve, reject) => {
      const currentUser = userPool.getCurrentUser();

      if (!currentUser) {
        reject(new Error('No hay usuario autenticado'));
        return;
      }

      currentUser.getSession((err, session) => {
        if (err) {
          reject(err);
          return;
        }

        currentUser.changePassword(oldPassword, newPassword, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }
}

const cognitoAuthService = new CognitoAuthService();
export default cognitoAuthService;

