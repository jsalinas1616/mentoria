# 🚀 GUÍA COMPLETA DE DEPLOYMENT - Nadro Mentoría

## Para deployar en cuenta AWS NUEVA desde CERO

Esta guía te llevará paso a paso para tener el sistema funcionando en AWS.
**Tiempo estimado: 30-45 minutos**



**MFA o doble autenticación estimado: 30-45 minutos**
 aws-mfa --profile qa-nadro
 aws-mfa --profile prod-nadro

---

## 📋 ANTES DE EMPEZAR

### ✅ Necesitas tener:
- [ ] Cuenta de AWS activa (nueva o existente)
- [ ] Tarjeta de crédito registrada en AWS (aunque no cobrarán si usas capa gratuita)
- [ ] Node.js 18+ instalado en tu computadora ([descargar aquí](https://nodejs.org/))
- [ ] Git instalado (para clonar el proyecto si es necesario)
- [ ] 30-45 minutos de tiempo

### 💰 Costo estimado:
- **Primer año:** GRATIS (capa gratuita de AWS)
- **Después:** ~$1-2 USD/mes con uso moderado

---

# PASO 1: INSTALAR AWS CLI

## 1.1 - Descargar e instalar AWS CLI

### En macOS:
```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

### En Windows:
Descarga el instalador desde: https://aws.amazon.com/cli/
Ejecuta el `.msi` y sigue las instrucciones.

### En Linux:
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

## 1.2 - Verificar instalación
```bash
aws --version
```

Deberías ver algo como: `aws-cli/2.x.x ...`

---

# PASO 2: CREAR USUARIO IAM EN AWS

## 2.1 - Ir a la consola de AWS
1. Abre https://aws.amazon.com/console/
2. Inicia sesión con tu cuenta
3. En la barra de búsqueda superior, busca **IAM**
4. Click en **IAM**

## 2.2 - Crear nuevo usuario
1. En el menú izquierdo → **Users** (Usuarios)
2. Click en **Create user** (Crear usuario)
3. Nombre del usuario: `nadro-deploy`
4. ✅ Marca: **Provide user access to the AWS Management Console** → **I want to create an IAM user**
5. Click **Next**

## 2.3 - Asignar permisos
1. Selecciona: **Attach policies directly** (Adjuntar políticas directamente)
2. Busca y marca las siguientes políticas:
   - ✅ `AWSLambda_FullAccess`
   - ✅ `AmazonAPIGatewayAdministrator`
   - ✅ `AmazonDynamoDBFullAccess`
   - ✅ `AmazonS3FullAccess`
   - ✅ `AmazonCognitoPowerUser`
   - ✅ `IAMFullAccess`
   - ✅ `CloudWatchLogsFullAccess`

> 📝 **Nota:** Para permisos más granulares y seguros, consulta el archivo `PERMISOS-AWS-SIMPLE.md`

3. Click **Next**
4. Click **Create user**

## 2.4 - Crear Access Keys
1. Click en el usuario recién creado
2. Ve a la pestaña **Security credentials**
3. Scroll hasta **Access keys**
4. Click **Create access key**
5. Selecciona: **Command Line Interface (CLI)**
6. ✅ Marca: "I understand..."
7. Click **Next** → **Create access key**
8. **⚠️ IMPORTANTE:** Descarga el CSV o copia las credenciales:
   - `Access Key ID`
   - `Secret Access Key`
   
   **¡NO podrás verlas de nuevo!**

---

# PASO 3: CONFIGURAR AWS CLI

## 3.1 - Configurar credenciales
```bash
aws configure
```

Ingresa los siguientes datos:
```
AWS Access Key ID: [pega tu Access Key]
AWS Secret Access Key: [pega tu Secret Key]
Default region name: us-east-1
Default output format: json
```

## 3.2 - Verificar configuración
```bash
aws sts get-caller-identity
```

Deberías ver tu Account ID, UserId y Arn. ✅

---

# PASO 4: INSTALAR DEPENDENCIAS DEL PROYECTO

## 4.1 - Navegar al proyecto
```bash
cd /ruta/a/tu/proyecto/Mentorias
```

## 4.2 - Instalar dependencias del backend
```bash
cd backend
npm install
```

Espera a que termine (puede tardar 1-2 minutos).

## 4.3 - Instalar dependencias del frontend
```bash
cd ../frontend
npm install
```

## 4.4 - Instalar dependencias de infraestructura
```bash
cd ../infrastructure
npm install
```

---

# PASO 5: DESPLEGAR BACKEND (Lambda + API Gateway + DynamoDB)

## 5.1 - Ir a la carpeta backend
```bash
cd ../backend
```

## 5.2 - Verificar que serverless.yml esté correcto
El archivo ya está configurado, solo verifica que exista:
```bash
ls serverless.yml
```

## 5.3 - Desplegar

Usa el comando de deploy con tu stage (ambiente):

```bash
# Para stage dev-jul (ejemplo backend)
npm run deploy:dev
# Para stage dev-jul (ejemplo frontend)
./deploy-frontend.sh dev-jul mentoria

# O directamente con serverless (más específico)
serverless deploy --stage dev-jul --profile mentoria
```

**Parámetros:**
- `--stage dev-jul` → El ambiente (dev, dev-jul, prod, etc.)
- `--profile mentoria` → Tu perfil de AWS

**⏱️ Esto tardará 3-5 minutos la primera vez.**

## 5.4 - Guardar la URL del API
Al final del deploy verás algo como:
```
endpoints:
  ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/{proxy+}
```

**⚠️ COPIA Y GUARDA ESTA URL** - La necesitarás después.

## 5.5 - Verificar que funcionó
```bash
# Reemplaza con tu URL
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/api/health
```

Deberías ver:
```json
{
  "status": "OK",
  "message": "Nadro Mentoría API funcionando correctamente",
  "timestamp": "2024-10-23T12:00:00.000Z",
  "version": "2.0.0"
}
```

✅ Si ves este mensaje, tu backend está funcionando correctamente!

✅ **¡Backend desplegado!**

---

# PASO 6: CONFIGURAR AWS COGNITO (Usuarios y Autenticación)

## 6.1 - ¿Qué se creó automáticamente?

El deploy del Paso 5 **YA CREÓ TODO ESTO EN COGNITO:**

✅ **Cognito User Pool** - Contenedor de usuarios
✅ **User Pool Client** - Aplicación cliente para login
✅ **Grupo "admin"** - Rol de administrador (precedencia 1)
✅ **Grupo "mentor"** - Rol de mentor (precedencia 2)
✅ **HTTP API Authorizer** - Validación automática de JWT

**No necesitas crear los roles manualmente**, ya están listos para usar.

## 6.2 - Obtener los IDs de Cognito

Después del deploy del paso 5, busca en la salida del terminal:
```
Stack Outputs:
CognitoUserPoolId: us-east-1_XXXXXXXXX
CognitoUserPoolClientId: 1234567890abcdefghijk
```

**⚠️ COPIA Y GUARDA ESTOS IDs en un lugar seguro** (Notepad, Notes, etc.)

### ¿Dónde se usan estos IDs?

1. **Backend:** Ya están configurados automáticamente ✅ (no necesitas hacer nada)
2. **Frontend:** Los necesitas para el archivo `.env.production` (Paso 7.4)
3. **Crear usuarios:** Los usas en los comandos `aws cognito-idp` (Paso 6.4)

## 6.3 - Verificar que los grupos se crearon

Puedes verificar en la consola de AWS que los grupos están listos:

1. Ve a AWS Console → busca **Cognito**
2. Click en **User Pools** → Click en `NadroMentoriaUserPool-[tu-stage]`
3. Ve a la pestaña **Groups**
4. Deberías ver:
   - ✅ **admin** (precedencia: 1)
   - ✅ **mentor** (precedencia: 2)

## 6.4 - Crear usuario administrador inicial

Ahora solo necesitas **crear el usuario** y **agregarlo al grupo admin** que ya existe.

### Opción A: Desde la consola de AWS (Recomendado para principiantes)

**Paso 1: Crear el usuario**
1. Ve a la consola de AWS → busca **Cognito**
2. Click en **User Pools** → Click en `NadroMentoriaUserPool-[tu-stage]`
3. Ve a la pestaña **Users**
4. Click **Create user**
5. Llena los datos:
   - Username: `admin@nadro.com`
   - Email: `admin@nadro.com`
   - ✅ Mark email as verified
   - Temporary password: `TempAdmin123!` (o cualquier contraseña con: mayúscula, minúscula, número, mínimo 8 caracteres)
6. Click **Create user**

**Paso 2: Agregar al grupo admin**
7. Ve a la pestaña **Groups**
8. Selecciona el grupo **admin** (que ya existe)
9. Click **Add users to group**
10. Selecciona `admin@nadro.com` → Click **Add**

✅ **¡Listo! Tu usuario admin ya puede hacer login.**

### Opción B: Desde línea de comandos (Más rápido)

**⚠️ IMPORTANTE:** Reemplaza `us-east-1_XXXXXXXXX` con tu **CognitoUserPoolId** del Paso 6.2

```bash
# Paso 1: Crear el usuario con contraseña temporal
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username admin@nadro.com \
  --user-attributes Name=email,Value=admin@nadro.com Name=email_verified,Value=true \
  --temporary-password "TempAdmin123!" \
  --message-action SUPPRESS

# Paso 2: Agregar al grupo admin (que ya existe automáticamente)
aws cognito-idp admin-add-user-to-group \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username admin@nadro.com \
  --group-name admin
```

**Ejemplo real:**
```bash
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_Ab12Cd34E \
  --username admin@nadro.com \
  --user-attributes Name=email,Value=admin@nadro.com Name=email_verified,Value=true \
  --temporary-password "TempAdmin123!" \
  --message-action SUPPRESS

aws cognito-idp admin-add-user-to-group \
  --user-pool-id us-east-1_Ab12Cd34E \
  --username admin@nadro.com \
  --group-name admin
```

✅ **¡Usuario administrador creado y agregado al grupo admin!**

**Importante:** El usuario deberá cambiar la contraseña temporal `TempAdmin123!` en el primer login.

---

# PASO 7: DESPLEGAR FRONTEND (S3)

## 7.1 - ¿Qué stage estás desplegando?

Primero define tu stage (ambiente):
- `dev` - Para ambiente de desarrollo
- `dev-jul` - Para ambiente de desarrollo de Julian (ejemplo)
- `prod` - Para producción

**Para este ejemplo usaremos:** `dev-jul`

## 7.2 - Configurar variables de entorno del frontend (AQUÍ VAN LOS IDs)

**⚠️ IMPORTANTE:** Aquí es donde usas los IDs de Cognito del Paso 6.2

```bash
cd frontend
```

Crea el archivo `.env.production` en la carpeta `frontend/`:

```env
REACT_APP_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/api
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
REACT_APP_COGNITO_CLIENT_ID=1234567890abcdefghijk
REACT_APP_AWS_REGION=us-east-1
```

**REEMPLAZA estos valores con TUS datos:**
- `xxxxxxxxxx` → Tu URL del API (del Paso 5.4)
- `us-east-1_XXXXXXXXX` → Tu **CognitoUserPoolId** (del Paso 6.2) 👈 AQUÍ
- `1234567890abcdefghijk` → Tu **CognitoUserPoolClientId** (del Paso 6.2) 👈 AQUÍ

**Ejemplo real:**
```env
REACT_APP_API_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/api
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_Ab12Cd34E
REACT_APP_COGNITO_CLIENT_ID=7abcdefg8hijklmno9pqrstu
REACT_APP_AWS_REGION=us-east-1
```

## 7.3 - Desplegar con el script automatizado 🚀

Ahora usa el script `deploy-frontend.sh` que hace TODO automáticamente:

```bash
# Sintaxis: ./deploy-frontend.sh [stage] [profile]
./deploy-frontend.sh dev-jul mentoria
```

**Parámetros:**
- `dev-jul` → El stage/ambiente (usa el mismo que en el backend)
- `mentoria` → Tu perfil de AWS (el que configuraste en `aws configure`)

El script hace automáticamente:
1. ✅ Instala dependencias (si faltan)
2. ✅ Compila el frontend (`npm run build`) usando `.env.production`
3. ✅ Crea el bucket S3: `nadro-mentoria-frontend-dev-jul`
4. ✅ Configura hosting estático
5. ✅ Configura CORS
6. ✅ Aplica política pública
7. ✅ Sube todos los archivos
8. ✅ Te muestra la URL final

**⏱️ Esto tarda 2-3 minutos.**

## 7.4 - Obtener URL del frontend

Al final del script verás:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Frontend desplegado exitosamente
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

URLs de tu aplicación:

  📱 Formulario Público:
     http://nadro-mentoria-frontend-dev-jul.s3-website-us-east-1.amazonaws.com

  🔐 Login Admin:
     http://nadro-mentoria-frontend-dev-jul.s3-website-us-east-1.amazonaws.com/#/admin/login
```

**⚠️ COPIA Y GUARDA ESTA URL**

✅ **¡Frontend desplegado!**

---

# PASO 8: VERIFICAR QUE TODO FUNCIONE

## 8.1 - Probar el API

### Health Check:
```bash
curl https://TU-API-URL.execute-api.us-east-1.amazonaws.com/api/health
```

Debe responder:
```json
{
  "status": "OK",
  "message": "Nadro Mentoría API funcionando correctamente",
  "timestamp": "2024-10-23T...",
  "version": "2.0.0"
}
```

✅ Si ves este JSON, tu API está funcionando correctamente y es accesible.

## 8.2 - Probar el Frontend

1. Abre en tu navegador la URL que te dio el script (reemplaza `dev-jul` con tu stage):
   ```
   http://nadro-mentoria-frontend-dev-jul.s3-website-us-east-1.amazonaws.com
   ```

2. Deberías ver la pantalla de login

3. Ingresa:
   - Email: `admin@nadro.com`
   - Password: La contraseña temporal que creaste

4. **Primera vez:** Cognito te pedirá cambiar la contraseña
   - Ingresa una nueva contraseña segura
   - **⚠️ GUARDA ESTA CONTRASEÑA**

5. Deberías ver el Dashboard

6. Prueba crear una consulta

✅ **¡SISTEMA COMPLETAMENTE FUNCIONAL!**

---

# PASO 9: CONFIGURAR DOMINIO PERSONALIZADO (OPCIONAL)

## 9.1 - Para el Frontend (HTTPS)

Si tienes un dominio (ej: `mentoria.tuempresa.com`):

1. Ve a AWS Console → **CloudFront**
2. Click **Create distribution**
3. Origin domain: `nadro-mentoria-frontend-2024.s3.us-east-1.amazonaws.com`
4. Origin access: **Origin access control settings**
5. Default root object: `index.html`
6. Click **Create distribution**
7. Anota el Domain name (ej: `d1234abcd.cloudfront.net`)

### Configurar certificado SSL:
1. Ve a **Certificate Manager** (ACM)
2. **⚠️ Cambia región a `us-east-1` (Virginia)**
3. Click **Request certificate**
4. Domain: `mentoria.tuempresa.com`
5. Validation: DNS
6. Sigue las instrucciones para validar

### Configurar dominio:
1. En Route 53 o tu proveedor de DNS
2. Crea un registro CNAME:
   - Name: `mentoria`
   - Value: Tu domain de CloudFront

---

# 📊 RESUMEN DE RECURSOS CREADOS

Al completar esta guía, habrás creado:

| Servicio | Recurso | URL/Identificador |
|----------|---------|-------------------|
| **Lambda** | nadro-mentoria-api-dev-api | (función automática) |
| **API Gateway** | HTTP API | https://xxxxx.execute-api.us-east-1.amazonaws.com |
| **DynamoDB** | NadroMentoria-Consultas | (tabla) |
| **DynamoDB** | NadroMentoria-Usuarios | (tabla) |
| **Cognito** | NadroMentoriaUserPool | us-east-1_XXXXXXX |
| **Cognito** | User Pool Client | 1234567890abcdefghijk |
| **Cognito** | Groups | admin, mentor |
| **S3** | nadro-mentoria-frontend-2024 | http://bucket.s3-website... |
| **CloudWatch** | Logs | /aws/lambda/nadro-mentoria-api-dev-api |

---

# 🔧 COMANDOS ÚTILES POST-DEPLOYMENT

## Ver logs del backend
```bash
cd backend
npm run logs
# o
serverless logs -f api -t
```

## Actualizar el backend
```bash
cd backend
# Hacer cambios en el código
npm run deploy
```

## Actualizar el frontend
```bash
cd frontend
# Hacer cambios en el código

# Opción 1: Usar el script (recomendado)
./deploy-frontend.sh dev-jul mentoria

# Opción 2: Manual
npm run build
aws s3 sync build/ s3://nadro-mentoria-frontend-dev-jul --delete --profile mentoria
```

## Ver datos en DynamoDB
```bash
# Listar consultas
aws dynamodb scan --table-name NadroMentoria-Consultas --region us-east-1

# Contar consultas
aws dynamodb scan --table-name NadroMentoria-Consultas --select COUNT --region us-east-1
```

## Backup de datos
```bash
aws dynamodb scan --table-name NadroMentoria-Consultas > backup-consultas-$(date +%Y%m%d).json
```

## Crear más usuarios (mentores, otros admins)

Los grupos **admin** y **mentor** ya existen. Solo creas usuarios y los agregas al grupo correspondiente:

```bash
# Ejemplo: Crear un mentor
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username mentor@nadro.com \
  --user-attributes Name=email,Value=mentor@nadro.com Name=email_verified,Value=true \
  --temporary-password "TempMentor123!" \
  --message-action SUPPRESS

# Agregar al grupo mentor (que ya existe)
aws cognito-idp admin-add-user-to-group \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username mentor@nadro.com \
  --group-name mentor
```

**Roles disponibles:**
- `admin` - Acceso completo (dashboard, consultas, usuarios, estadísticas)
- `mentor` - Acceso limitado (solo consultas, sin estadísticas ni gestión de usuarios)

---

# 🆘 SOLUCIÓN DE PROBLEMAS

## Error: "Access Denied" al desplegar
**Causa:** Permisos IAM insuficientes
**Solución:**
1. Ve a IAM en la consola de AWS
2. Verifica que tu usuario tenga todas las políticas del Paso 2.3
3. Si no, agrégalas

## Error: "Bucket name already exists"
**Causa:** El nombre del bucket S3 ya está en uso globalmente
**Solución:**
```bash
# Usa un nombre único, ejemplo:
aws s3 mb s3://nadro-mentoria-TUEMPRESA-2024 --region us-east-1
```

## Error: "Module not found" al desplegar
**Causa:** Dependencias no instaladas
**Solución:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run deploy
```

## Error: CORS en el frontend
**Causa:** URL del API incorrecta o no configurada
**Solución:**
1. Verifica que `frontend/.env.production` tenga la URL correcta
2. Reconstruye: `npm run build`
3. Re-sube a S3: `aws s3 sync build/ s3://tu-bucket --delete`

## Error: "Cannot connect to API"
**Causa:** Variables de entorno incorrectas
**Solución:**
1. Verifica `frontend/.env.production`
2. Asegúrate que las URLs sean correctas (sin / al final)
3. Rebuilda el frontend

## El login no funciona
**Causa:** Usuario no en el grupo correcto
**Solución:**
```bash
# Verifica grupos del usuario
aws cognito-idp admin-list-groups-for-user \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username admin@nadro.com

# Agregar al grupo admin si falta
aws cognito-idp admin-add-user-to-group \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username admin@nadro.com \
  --group-name admin
```

## Error: "User pool does not exist"
**Causa:** El Cognito User Pool no se creó en el deploy
**Solución:**
```bash
cd backend
serverless deploy --verbose
# Busca errores en la salida
```

## Lambda timeout
**Causa:** Función tarda demasiado
**Solución:** Ya está configurado en 30 segundos en `serverless.yml`

## Olvidé mi contraseña
**Solución:**
```bash
# Resetear contraseña
aws cognito-idp admin-set-user-password \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username admin@nadro.com \
  --password "NuevoPass123!" \
  --permanent
```

---

# 💰 COSTOS Y OPTIMIZACIÓN

## Costo estimado mensual (uso moderado):

| Servicio | Uso | Costo con Free Tier | Costo sin Free Tier |
|----------|-----|---------------------|---------------------|
| Lambda | 10,000 invocaciones | $0.00 | $0.20 |
| API Gateway | 10,000 requests | $0.00 | $0.35 |
| DynamoDB | 1GB + reads/writes | $0.00 | $1.25 |
| Cognito | 1,000 usuarios | $0.00 | $0.00 |
| S3 | 1GB storage | $0.00 | $0.05 |
| **TOTAL** | | **$0.00** | **~$1.85/mes** |

💡 **Free Tier de AWS:**
- Lambda: 1M requests/mes GRATIS
- API Gateway: 1M requests/mes GRATIS por 12 meses
- DynamoDB: 25GB GRATIS
- S3: 5GB GRATIS por 12 meses
- Cognito: 50,000 MAU GRATIS

## Alertas de costos (recomendado):

1. Ve a AWS Console → **Billing**
2. Click **Budgets** → **Create budget**
3. Selecciona **Cost budget**
4. Amount: $5.00 USD
5. Email: tu-email@ejemplo.com
6. Recibirás alertas si gastas más de $5/mes

---

# 🗑️ ELIMINAR TODO (Si ya no lo necesitas)

## ⚠️ ADVERTENCIA: Esto borrará TODOS los datos permanentemente

```bash
# 1. Eliminar backend (Lambda, API Gateway, DynamoDB, Cognito)
cd backend
serverless remove --stage dev-jul

# 2. Eliminar frontend de S3 (reemplaza dev-jul con tu stage)
aws s3 rm s3://nadro-mentoria-frontend-dev-jul --recursive --profile mentoria
aws s3 rb s3://nadro-mentoria-frontend-dev-jul --profile mentoria
```

---

# ✅ CHECKLIST FINAL

Verifica que todo esté funcionando:

- [ ] Backend desplegado y respondiendo en `/api/health`
- [ ] DynamoDB tablas creadas (Consultas, Usuarios)
- [ ] Cognito User Pool creado con grupos admin y mentor
- [ ] Usuario administrador creado y en grupo admin
- [ ] Frontend desplegado en S3
- [ ] Frontend carga correctamente en el navegador
- [ ] Puedes hacer login con admin@nadro.com
- [ ] Puedes cambiar la contraseña temporal
- [ ] Dashboard carga correctamente
- [ ] Puedes crear una consulta de prueba
- [ ] La consulta aparece en el dashboard
- [ ] Puedes exportar datos a Excel

---

# 🎉 ¡FELICIDADES!

Tu sistema Nadro Mentoría está completamente desplegado en AWS y listo para producción.

## 📝 Guarda esta información:

```
=== INFORMACIÓN DE TU DEPLOYMENT ===

Stage: dev-jul (o el que elegiste)

Frontend URL: http://nadro-mentoria-frontend-dev-jul.s3-website-us-east-1.amazonaws.com
API URL: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com

Cognito User Pool ID: us-east-1_XXXXXXXXX
Cognito Client ID: 1234567890abcdefghijk

Admin Email: admin@nadro.com
Admin Password: [tu nueva contraseña]

AWS Profile: mentoria
Región: us-east-1
===================================
```

## 📚 Recursos adicionales:

- **Permisos detallados:** Ver archivo `PERMISOS-AWS-SIMPLE.md`
- **Documentación técnica:** Ver archivo `COGNITO-IMPLEMENTACION.md`
- **Changelog:** Ver archivo `CHANGELOG.md`

---

**Desarrollado con ❤️ para Nadro**

Sistema: Nadro Mentoría v2.0.0 (con AWS Cognito)
Última actualización: Octubre 2024

