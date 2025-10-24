# 🔐 Implementación de AWS Cognito con Roles

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura con Cognito](#arquitectura-con-cognito)
3. [Configuración de Cognito](#configuración-de-cognito)
4. [Implementación Backend](#implementación-backend)
5. [Implementación Frontend](#implementación-frontend)
6. [Migración de Usuarios](#migración-de-usuarios)
7. [Testing](#testing)

---

## Visión General

### ¿Por qué Cognito?

**Beneficios:**
- ✅ **Autenticación gestionada**: AWS maneja toda la seguridad
- ✅ **Roles con User Groups**: Sistema nativo de grupos/roles
- ✅ **MFA nativo**: Autenticación multifactor incluida
- ✅ **Recuperación de contraseña**: Flujos pre-construidos
- ✅ **Tokens JWT seguros**: Firmados y validados por AWS
- ✅ **Escalable**: Sin límite de usuarios
- ✅ **Integración AWS**: Se conecta fácilmente con Lambda, API Gateway, etc.

**Estructura de Roles:**
- **Admin**: Acceso completo al dashboard y configuraciones
- **Mentor**: Acceso al dashboard y consultas
- **Empleado**: Solo puede crear consultas

---

## Arquitectura con Cognito

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Login → Cognito SDK → Obtiene Token JWT            │  │
│  │  Token incluye: email, sub, cognito:groups          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ Token JWT
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              API Gateway (AWS HTTP API)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Authorizer: Cognito User Pool                       │  │
│  │  Valida Token automáticamente                        │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ Validated Token
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    LAMBDA (Backend)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware: extrae cognito:groups del token         │  │
│  │  Controllers: verifican roles según el grupo         │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                ┌────────────────┐
                │   DynamoDB     │
                │   (Consultas)  │
                └────────────────┘
```

---

## Configuración de Cognito

### 1. Actualizar `serverless.yml`

```yaml
service: nadro-mentoria-api

frameworkVersion: '4'

provider:
  name: aws
  runtime: nodejs18.x
  region: ${opt:region, 'us-east-1'}
  stage: ${opt:stage, 'dev'}
  profile: ${opt:profile, 'default'}
  timeout: ${self:custom.timeout.${self:provider.stage}, 30}
  memorySize: ${self:custom.memorySize.${self:provider.stage}, 512}
  environment:
    NODE_ENV: ${self:provider.stage}
    COGNITO_USER_POOL_ID: !Ref CognitoUserPool
    COGNITO_CLIENT_ID: !Ref CognitoUserPoolClient
    CONSULTAS_TABLE: NadroMentoria-Consultas-${self:provider.stage}
    USUARIOS_TABLE: NadroMentoria-Usuarios-${self:provider.stage}
  
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:Query
            - dynamodb:Scan
            - dynamodb:GetItem
            - dynamodb:PutItem
            - dynamodb:UpdateItem
            - dynamodb:DeleteItem
          Resource:
            - "arn:aws:dynamodb:${self:provider.region}:*:table/NadroMentoria-Consultas-${self:provider.stage}"
            - "arn:aws:dynamodb:${self:provider.region}:*:table/NadroMentoria-Usuarios-${self:provider.stage}"
        - Effect: Allow
          Action:
            - cognito-idp:AdminGetUser
            - cognito-idp:AdminListGroupsForUser
            - cognito-idp:ListUsers
            - cognito-idp:AdminAddUserToGroup
            - cognito-idp:AdminRemoveUserFromGroup
            - cognito-idp:AdminUpdateUserAttributes
          Resource:
            - !GetAtt CognitoUserPool.Arn

functions:
  api:
    handler: src/lambda.handler
    events:
      - httpApi:
          path: /api/{proxy+}
          method: ANY
          authorizer:
            type: jwt
            id: !Ref HttpApiAuthorizer
      - httpApi:
          path: /api
          method: ANY
          authorizer:
            type: jwt
            id: !Ref HttpApiAuthorizer
      - httpApi:
          path: /
          method: GET

plugins:
  - serverless-offline

custom:
  serverless-offline:
    httpPort: 3001
  
  timeout:
    dev: 30
    'dev-jul': 30
    prod: 30
  
  memorySize:
    dev: 512
    'dev-jul': 1024
    prod: 2048

resources:
  Resources:
    # Cognito User Pool
    CognitoUserPool:
      Type: AWS::Cognito::UserPool
      Properties:
        UserPoolName: NadroMentoria-UserPool-${self:provider.stage}
        UsernameAttributes:
          - email
        AutoVerifiedAttributes:
          - email
        Schema:
          - Name: email
            Required: true
            Mutable: false
          - Name: name
            Required: true
            Mutable: true
          - Name: employeeId
            AttributeDataType: String
            Required: false
            Mutable: true
        Policies:
          PasswordPolicy:
            MinimumLength: 8
            RequireUppercase: true
            RequireLowercase: true
            RequireNumbers: true
            RequireSymbols: false
        MfaConfiguration: OPTIONAL
        EnabledMfas:
          - SOFTWARE_TOKEN_MFA
        AccountRecoverySetting:
          RecoveryMechanisms:
            - Name: verified_email
              Priority: 1
        UserPoolTags:
          Environment: ${self:provider.stage}
          Project: NadroMentoria

    # Cognito User Pool Client
    CognitoUserPoolClient:
      Type: AWS::Cognito::UserPoolClient
      Properties:
        ClientName: NadroMentoria-Client-${self:provider.stage}
        UserPoolId: !Ref CognitoUserPool
        GenerateSecret: false
        ExplicitAuthFlows:
          - ALLOW_USER_PASSWORD_AUTH
          - ALLOW_REFRESH_TOKEN_AUTH
          - ALLOW_USER_SRP_AUTH
        PreventUserExistenceErrors: ENABLED
        AccessTokenValidity: 1
        IdTokenValidity: 1
        RefreshTokenValidity: 30
        TokenValidityUnits:
          AccessToken: hours
          IdToken: hours
          RefreshToken: days

    # Cognito User Groups (Roles)
    CognitoUserPoolGroupAdmin:
      Type: AWS::Cognito::UserPoolGroup
      Properties:
        GroupName: admin
        Description: Administradores con acceso completo
        UserPoolId: !Ref CognitoUserPool
        Precedence: 1

    CognitoUserPoolGroupMentor:
      Type: AWS::Cognito::UserPoolGroup
      Properties:
        GroupName: mentor
        Description: Mentores con acceso al dashboard
        UserPoolId: !Ref CognitoUserPool
        Precedence: 2

    CognitoUserPoolGroupEmpleado:
      Type: AWS::Cognito::UserPoolGroup
      Properties:
        GroupName: empleado
        Description: Empleados que pueden crear consultas
        UserPoolId: !Ref CognitoUserPool
        Precedence: 3

    # HTTP API Authorizer
    HttpApiAuthorizer:
      Type: AWS::ApiGatewayV2::Authorizer
      Properties:
        ApiId: !Ref HttpApi
        AuthorizerType: JWT
        IdentitySource:
          - $request.header.Authorization
        JwtConfiguration:
          Audience:
            - !Ref CognitoUserPoolClient
          Issuer: !Sub https://cognito-idp.${AWS::Region}.amazonaws.com/${CognitoUserPool}
        Name: CognitoAuthorizer

  Outputs:
    CognitoUserPoolId:
      Value: !Ref CognitoUserPool
      Export:
        Name: NadroMentoria-UserPoolId-${self:provider.stage}
    
    CognitoUserPoolClientId:
      Value: !Ref CognitoUserPoolClient
      Export:
        Name: NadroMentoria-UserPoolClientId-${self:provider.stage}
    
    CognitoUserPoolArn:
      Value: !GetAtt CognitoUserPool.Arn
      Export:
        Name: NadroMentoria-UserPoolArn-${self:provider.stage}
```

---

## Implementación Backend

### 2. Instalar Dependencias

```bash
cd backend
npm install amazon-cognito-identity-js aws-sdk
```

### 3. Crear Servicio de Cognito: `backend/src/services/cognitoService.js`

```javascript
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
        employeeId: attributes['custom:employeeId'],
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
   */
  async createUser(email, name, temporaryPassword, role = 'empleado') {
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
}

module.exports = new CognitoService();
```

### 4. Actualizar Middleware de Autenticación: `backend/src/middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');
const cognitoService = require('../services/cognitoService');

/**
 * Middleware para autenticar con Cognito JWT
 */
const authenticateCognito = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token de autenticación requerido' });
    }

    // Decodificar el token (ya fue validado por API Gateway)
    const decoded = jwt.decode(token);
    
    if (!decoded) {
      return res.status(403).json({ message: 'Token inválido' });
    }

    // Extraer información del usuario
    const userInfo = {
      id: decoded.sub, // Cognito user ID
      email: decoded.email,
      username: decoded['cognito:username'],
      groups: decoded['cognito:groups'] || [], // Roles
      tokenUse: decoded.token_use,
    };

    // Agregar al request
    req.user = userInfo;
    req.cognitoToken = decoded;

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(403).json({ message: 'Error al autenticar' });
  }
};

/**
 * Middleware para verificar roles
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.groups) {
      return res.status(403).json({ message: 'Acceso denegado: sin permisos' });
    }

    const userRoles = req.user.groups;
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({ 
        message: 'Acceso denegado: permisos insuficientes',
        requiredRoles: allowedRoles,
        userRoles: userRoles,
      });
    }

    next();
  };
};

/**
 * Verificar si el usuario es admin
 */
const requireAdmin = requireRole('admin');

/**
 * Verificar si el usuario es admin o mentor
 */
const requireMentorOrAdmin = requireRole('admin', 'mentor');

module.exports = {
  authenticateCognito,
  requireRole,
  requireAdmin,
  requireMentorOrAdmin,
};
```

### 5. Actualizar Controller de Auth: `backend/src/controllers/authController.js`

```javascript
const cognitoService = require('../services/cognitoService');

class AuthController {
  /**
   * Obtener información del usuario autenticado
   */
  async obtenerUsuario(req, res, next) {
    try {
      const { email } = req.user;
      
      // Obtener info completa de Cognito
      const userInfo = await cognitoService.getUserInfo(email);
      const groups = await cognitoService.getUserGroups(email);

      res.json({
        ...userInfo,
        roles: groups,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear nuevo usuario (solo admin)
   */
  async crearUsuario(req, res, next) {
    try {
      const { email, nombre, password, rol } = req.body;

      if (!email || !nombre || !password || !rol) {
        return res.status(400).json({ 
          message: 'Email, nombre, contraseña y rol son requeridos' 
        });
      }

      const usuario = await cognitoService.createUser(
        email,
        nombre,
        password,
        rol
      );

      res.status(201).json(usuario);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cambiar rol del usuario (solo admin)
   */
  async cambiarRol(req, res, next) {
    try {
      const { email } = req.params;
      const { nuevoRol, rolAnterior } = req.body;

      if (!nuevoRol) {
        return res.status(400).json({ message: 'Nuevo rol es requerido' });
      }

      // Remover del rol anterior si se proporciona
      if (rolAnterior) {
        await cognitoService.removeUserFromGroup(email, rolAnterior);
      }

      // Agregar al nuevo rol
      await cognitoService.addUserToGroup(email, nuevoRol);

      res.json({ 
        success: true, 
        message: `Rol actualizado a ${nuevoRol}` 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deshabilitar usuario (solo admin)
   */
  async deshabilitarUsuario(req, res, next) {
    try {
      const { email } = req.params;
      const result = await cognitoService.disableUser(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Habilitar usuario (solo admin)
   */
  async habilitarUsuario(req, res, next) {
    try {
      const { email } = req.params;
      const result = await cognitoService.enableUser(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
```

### 6. Actualizar Rutas: `backend/src/routes/authRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateCognito, requireAdmin } = require('../middleware/auth');

// Rutas protegidas (requieren autenticación)
router.get('/me', authenticateCognito, authController.obtenerUsuario);

// Rutas de administración (solo admin)
router.post('/usuarios', authenticateCognito, requireAdmin, authController.crearUsuario);
router.put('/usuarios/:email/rol', authenticateCognito, requireAdmin, authController.cambiarRol);
router.put('/usuarios/:email/deshabilitar', authenticateCognito, requireAdmin, authController.deshabilitarUsuario);
router.put('/usuarios/:email/habilitar', authenticateCognito, requireAdmin, authController.habilitarUsuario);

module.exports = router;
```

### 7. Actualizar Rutas de Dashboard: `backend/src/routes/dashboardRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateCognito, requireMentorOrAdmin } = require('../middleware/auth');

// Todas las rutas del dashboard requieren ser mentor o admin
router.use(authenticateCognito, requireMentorOrAdmin);

router.get('/stats', dashboardController.obtenerEstadisticas);
router.get('/consultas', dashboardController.obtenerConsultasRecientes);

module.exports = router;
```

---

## Implementación Frontend

### 8. Instalar SDK de Cognito en Frontend

```bash
cd frontend
npm install amazon-cognito-identity-js
```

### 9. Crear Servicio de Cognito: `frontend/src/services/cognitoAuth.js`

```javascript
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

// Configuración del User Pool (obtener estos valores después del deploy)
const poolData = {
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || 'us-east-1_XXXXXXX',
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || 'xxxxxxxxxxxxxxxxxxxx',
};

const userPool = new CognitoUserPool(poolData);

class CognitoAuthService {
  /**
   * Iniciar sesión
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

          // Obtener información del usuario
          const payload = session.getIdToken().payload;
          const groups = payload['cognito:groups'] || [];

          const userData = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            username: payload['cognito:username'],
            roles: groups,
            // Determinar rol principal (el de mayor precedencia)
            rol: groups.includes('admin') ? 'admin' : 
                 groups.includes('mentor') ? 'mentor' : 
                 groups.includes('empleado') ? 'empleado' : 'empleado',
          };

          // Guardar tokens en localStorage
          localStorage.setItem('idToken', idToken);
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(userData));

          resolve({
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
        newPasswordRequired: (userAttributes) => {
          // Usuario debe cambiar contraseña temporal
          resolve({
            newPasswordRequired: true,
            userAttributes,
            cognitoUser,
          });
        },
      });
    });
  }

  /**
   * Completar cambio de contraseña (primera vez)
   */
  completeNewPassword(cognitoUser, newPassword, userAttributes) {
    return new Promise((resolve, reject) => {
      // Eliminar atributos que no se pueden modificar
      delete userAttributes.email_verified;
      delete userAttributes.email;

      cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, {
        onSuccess: (session) => {
          const idToken = session.getIdToken().getJwtToken();
          const payload = session.getIdToken().payload;
          const groups = payload['cognito:groups'] || [];

          const userData = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            roles: groups,
            rol: groups.includes('admin') ? 'admin' : 
                 groups.includes('mentor') ? 'mentor' : 'empleado',
          };

          localStorage.setItem('idToken', idToken);
          localStorage.setItem('user', JSON.stringify(userData));

          resolve({ user: userData, session });
        },
        onFailure: (err) => {
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

        resolve({
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          roles: groups,
          rol: groups.includes('admin') ? 'admin' : 
               groups.includes('mentor') ? 'mentor' : 'empleado',
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
    return !!token;
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
   * Confirmar nueva contraseña
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

export default new CognitoAuthService();
```

### 10. Actualizar Servicio API: `frontend/src/services/api.js`

```javascript
import axios from 'axios';
import cognitoAuth from './cognitoAuth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = cognitoAuth.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      cognitoAuth.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación con Cognito
export const authService = {
  login: (email, password) => cognitoAuth.login(email, password),
  logout: () => cognitoAuth.logout(),
  getCurrentUser: () => cognitoAuth.getCurrentUser(),
  isAuthenticated: () => cognitoAuth.isAuthenticated(),
  forgotPassword: (email) => cognitoAuth.forgotPassword(email),
  confirmPassword: (email, code, newPassword) => 
    cognitoAuth.confirmPassword(email, code, newPassword),
  changePassword: (oldPassword, newPassword) => 
    cognitoAuth.changePassword(oldPassword, newPassword),
};

// Servicios de consultas
export const consultasService = {
  crear: (data) => api.post('/consultas', data),
  obtenerTodas: (filtros) => api.get('/consultas', { params: filtros }),
  obtenerPorId: (id) => api.get(`/consultas/${id}`),
  actualizar: (id, data) => api.put(`/consultas/${id}`, data),
  eliminar: (id) => api.delete(`/consultas/${id}`),
};

// Servicios de dashboard
export const dashboardService = {
  obtenerEstadisticas: () => api.get('/dashboard/stats'),
  obtenerConsultasRecientes: (limite) => 
    api.get('/dashboard/consultas', { params: { limit: limite } }),
};

export default api;
```

### 11. Actualizar Login Component: `frontend/src/components/Auth/Login.jsx`

```javascript
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { authService } from '../../services/api';
import { validarEmail, validarRequerido } from '../../utils/validation';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estados para cambio de contraseña obligatorio
  const [needNewPassword, setNeedNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cognitoUserTemp, setCognitoUserTemp] = useState(null);
  const [userAttributesTemp, setUserAttributesTemp] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validarRequerido(formData.email)) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!validarEmail(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!validarRequerido(formData.password)) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(formData.email, formData.password);
      
      // Si requiere cambio de contraseña
      if (response.newPasswordRequired) {
        setNeedNewPassword(true);
        setCognitoUserTemp(response.cognitoUser);
        setUserAttributesTemp(response.userAttributes);
        setLoading(false);
        return;
      }

      // Login exitoso
      console.log('Login exitoso. Rol:', response.user.rol);
      onLoginSuccess(response.user);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      
      let message = 'Error al iniciar sesión. Verifica tus credenciales.';
      
      if (error.code === 'UserNotFoundException') {
        message = 'Usuario no encontrado';
      } else if (error.code === 'NotAuthorizedException') {
        message = 'Contraseña incorrecta';
      } else if (error.code === 'UserNotConfirmedException') {
        message = 'Usuario no confirmado. Revisa tu correo.';
      } else if (error.code === 'PasswordResetRequiredException') {
        message = 'Debes restablecer tu contraseña';
      } else if (error.code === 'TooManyRequestsException') {
        message = 'Demasiados intentos. Intenta más tarde.';
      }
      
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.completeNewPassword(
        cognitoUserTemp,
        newPassword,
        userAttributesTemp
      );

      console.log('Contraseña actualizada. Rol:', response.user.rol);
      onLoginSuccess(response.user);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setErrorMessage(error.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de cambio de contraseña obligatorio
  if (needNewPassword) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="mb-4">
              <img 
                src="/LOGO_Blanco.png" 
                alt="Nadro Mentoría" 
                className="h-16 w-auto"
              />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900">Cambio de Contraseña Requerido</h1>
              <p className="text-xs text-gray-500">Establece tu nueva contraseña</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-soft p-8 md:p-10 border border-gray-300/50">
            <form onSubmit={handleNewPasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>

              {errorMessage && (
                <div className="bg-gradient-to-r from-maple/10 to-maple-light/10 border-2 border-rose text-rose px-5 py-4 rounded-2xl text-sm font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-light text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-60"
              >
                {loading ? 'ACTUALIZANDO...' : 'CAMBIAR CONTRASEÑA'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de login normal
  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="mb-4">
            <img 
              src="/LOGO_Blanco.png" 
              alt="Nadro Mentoría" 
              className="h-16 w-auto"
            />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900">Acceso Administrativo</h1>
            <p className="text-xs text-gray-500">Panel de control</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-soft p-8 md:p-10 border border-gray-300/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                Correo Electrónico
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ingresa tu email"
                className={`w-full bg-white border-2 text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                  errors.email ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="text-rose text-sm mt-1.5">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  className={`w-full bg-white border-2 text-gray-900 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md ${
                    errors.password ? 'border-rose focus:border-rose focus:ring-rose/10' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose text-sm mt-1.5">{errors.password}</p>
              )}
            </div>

            {errorMessage && (
              <div className="bg-gradient-to-r from-maple/10 to-maple-light/10 border-2 border-rose text-rose px-5 py-4 rounded-2xl text-sm font-medium shadow-lg flex items-start gap-3">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <span className="relative z-10 text-lg tracking-wide">
                {loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
              </span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  // Implementar modal de recuperación
                  alert('Función de recuperación de contraseña próximamente');
                }}
                className="text-primary hover:text-primary-light text-sm font-medium transition-colors underline decoration-primary/30 hover:decoration-primary"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-6 flex items-center justify-center gap-2 text-gray-600 text-sm">
          <Lock size={16} />
          <span>Autenticación segura con AWS Cognito</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

### 12. Crear archivo `.env` para Frontend

```bash
# frontend/.env.local
REACT_APP_API_URL=https://tu-api-id.execute-api.us-east-1.amazonaws.com/api
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_XXXXXXX
REACT_APP_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
```

---

## Migración de Usuarios

### 13. Script para Migrar Usuarios Existentes

Crear archivo: `infrastructure/migrate-users-to-cognito.js`

```javascript
const AWS = require('aws-sdk');
const { dynamodb, TABLES } = require('../backend/src/config/database');
require('dotenv').config();

const cognito = new AWS.CognitoIdentityServiceProvider();

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const DEFAULT_TEMP_PASSWORD = 'Temporal123!'; // Los usuarios cambiarán esto en el primer login

async function migrateUsers() {
  try {
    console.log('🔄 Iniciando migración de usuarios a Cognito...');

    // Obtener todos los usuarios de DynamoDB
    const params = {
      TableName: TABLES.USUARIOS,
    };

    const result = await dynamodb.scan(params).promise();
    const usuarios = result.Items;

    console.log(`📊 Usuarios encontrados: ${usuarios.length}`);

    for (const usuario of usuarios) {
      try {
        console.log(`\n👤 Migrando usuario: ${usuario.email}`);

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

        // Agregar al grupo según su rol
        const rol = usuario.rol || 'empleado';
        const groupParams = {
          UserPoolId: USER_POOL_ID,
          Username: usuario.email,
          GroupName: rol,
        };

        await cognito.adminAddUserToGroup(groupParams).promise();
        console.log(`  ✅ Agregado al grupo: ${rol}`);

      } catch (error) {
        if (error.code === 'UsernameExistsException') {
          console.log(`  ⚠️  Usuario ya existe en Cognito: ${usuario.email}`);
          
          // Verificar y agregar al grupo si no está
          try {
            const rol = usuario.rol || 'empleado';
            await cognito.adminAddUserToGroup({
              UserPoolId: USER_POOL_ID,
              Username: usuario.email,
              GroupName: rol,
            }).promise();
            console.log(`  ✅ Agregado al grupo: ${rol}`);
          } catch (groupError) {
            console.log(`  ⚠️  Ya está en el grupo`);
          }
        } else {
          console.error(`  ❌ Error migrando ${usuario.email}:`, error.message);
        }
      }
    }

    console.log('\n✅ Migración completada!');
    console.log(`\n📧 IMPORTANTE: Notifica a los usuarios que su contraseña temporal es: ${DEFAULT_TEMP_PASSWORD}`);
    console.log('   Deberán cambiarla en el primer inicio de sesión.\n');

  } catch (error) {
    console.error('❌ Error en migración:', error);
  }
}

// Ejecutar migración
migrateUsers();
```

---

## Testing

### 14. Script de Prueba

Crear archivo: `testpermisos/test-cognito-auth.sh`

```bash
#!/bin/bash

echo "🧪 Pruebas de Autenticación con Cognito"
echo "======================================"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables
API_URL="https://tu-api-id.execute-api.us-east-1.amazonaws.com/api"
USER_POOL_ID="us-east-1_XXXXXXX"
CLIENT_ID="xxxxxxxxxxxxxxxxxxxx"
REGION="us-east-1"

# Función para login con Cognito
login() {
  local email=$1
  local password=$2
  
  echo -e "\n${YELLOW}🔐 Login: $email${NC}"
  
  # Usar AWS CLI para autenticar
  aws cognito-idp initiate-auth \
    --region $REGION \
    --auth-flow USER_PASSWORD_AUTH \
    --client-id $CLIENT_ID \
    --auth-parameters USERNAME=$email,PASSWORD=$password \
    --output json > /tmp/cognito-token.json
  
  if [ $? -eq 0 ]; then
    ID_TOKEN=$(jq -r '.AuthenticationResult.IdToken' /tmp/cognito-token.json)
    echo -e "${GREEN}✅ Login exitoso${NC}"
    echo $ID_TOKEN
  else
    echo -e "${RED}❌ Login fallido${NC}"
    return 1
  fi
}

# Test 1: Login admin
echo -e "\n${YELLOW}TEST 1: Login como Admin${NC}"
TOKEN=$(login "admin@nadro.com" "Admin123!")
if [ ! -z "$TOKEN" ]; then
  echo "Token obtenido (primeros 50 caracteres): ${TOKEN:0:50}..."
fi

# Test 2: Acceso a dashboard con token admin
echo -e "\n${YELLOW}TEST 2: Acceso a Dashboard (Admin)${NC}"
curl -s -X GET "$API_URL/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

# Test 3: Login mentor
echo -e "\n${YELLOW}TEST 3: Login como Mentor${NC}"
TOKEN_MENTOR=$(login "mentor@nadro.com" "Mentor123!")

# Test 4: Acceso a dashboard con token mentor
echo -e "\n${YELLOW}TEST 4: Acceso a Dashboard (Mentor)${NC}"
curl -s -X GET "$API_URL/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN_MENTOR" \
  -H "Content-Type: application/json" | jq .

# Test 5: Login empleado
echo -e "\n${YELLOW}TEST 5: Login como Empleado${NC}"
TOKEN_EMPLEADO=$(login "empleado@nadro.com" "Empleado123!")

# Test 6: Intento de acceso a dashboard con token empleado (debe fallar)
echo -e "\n${YELLOW}TEST 6: Intento de Acceso a Dashboard (Empleado - debe fallar)${NC}"
curl -s -X GET "$API_URL/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN_EMPLEADO" \
  -H "Content-Type: application/json" | jq .

# Test 7: Crear consulta como empleado (debe funcionar)
echo -e "\n${YELLOW}TEST 7: Crear Consulta (Empleado)${NC}"
curl -s -X POST "$API_URL/consultas" \
  -H "Authorization: Bearer $TOKEN_EMPLEADO" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreEmpleado": "Test Empleado",
    "numeroEmpleado": "12345",
    "motivoConsulta": "Duda sobre beneficios",
    "area": "Recursos Humanos"
  }' | jq .

echo -e "\n${GREEN}✅ Pruebas completadas${NC}"
```

---

## Despliegue

### 15. Pasos para Desplegar

```bash
# 1. Desplegar backend con Cognito
cd backend
npm install
serverless deploy --stage dev

# 2. Obtener los valores de Cognito del deploy
# Se mostrarán en los Outputs:
#   - CognitoUserPoolId
#   - CognitoUserPoolClientId

# 3. Actualizar .env del frontend
cd ../frontend
cat > .env.local << EOF
REACT_APP_API_URL=https://tu-api-id.execute-api.us-east-1.amazonaws.com/api
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_XXXXXXX
REACT_APP_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
EOF

# 4. Instalar dependencias y compilar frontend
npm install
npm run build

# 5. Migrar usuarios existentes a Cognito
cd ../infrastructure
node migrate-users-to-cognito.js

# 6. Desplegar frontend
cd ../frontend
./deploy-frontend.sh
```

---

## Ventajas de esta Implementación

### ✅ Seguridad
- Tokens JWT firmados por AWS
- MFA opcional disponible
- Recuperación de contraseña segura
- No más contraseñas hasheadas en DynamoDB

### ✅ Escalabilidad
- AWS maneja millones de usuarios
- Sin preocupaciones de performance

### ✅ Mantenibilidad
- Menos código custom de auth
- AWS gestiona updates de seguridad
- Roles fáciles de gestionar

### ✅ Funcionalidades Extra
- MFA con un click
- Social login (Google, Facebook) fácil de agregar
- Federación con SAML/OIDC
- Triggers personalizados (Lambda)

---

## Próximos Pasos

1. **Implementar MFA**: Activar autenticación de dos factores
2. **Email Templates**: Personalizar emails de Cognito
3. **Lambda Triggers**: Agregar lógica personalizada en eventos de auth
4. **Social Login**: Integrar Google/Microsoft
5. **Monitoreo**: CloudWatch logs de autenticación

---

## Soporte

Si tienes dudas sobre la implementación, revisa:
- [Documentación de Cognito](https://docs.aws.amazon.com/cognito/)
- [SDK de JavaScript](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/)

