# 🚀 Guía de Despliegue - NADRO-QA

## 📋 Resumen de Ambientes

| Ambiente | Stage | Propósito | Profile AWS |
|----------|-------|-----------|-------------|
| **QA** | `nadro-qa` | Testing oficial | `qa-nadro` |
| **DEV** | `dev-jul` | Desarrollo personal | `mentoria` |
| **PROD** | `prod` | Producción | `mentoria` |

---

## 🎯 Nomenclatura de Recursos

### Backend (Serverless)
```
API Gateway:  nadro-mentoria-api-nadro-qa
Lambda:       nadro-mentoria-api-nadro-qa-api
DynamoDB:     NadroMentoria-Consultas-nadro-qa
              NadroMentoria-Usuarios-nadro-qa
              NadroMentoria-Capacitaciones-nadro-qa
Cognito:      NadroMentoria-UserPool-nadro-qa
```

### Frontend (S3 + CloudFront)
```
Bucket:       nadro-mentoria-frontend-qa
CloudFront:   https://xxxxx.cloudfront.net
S3 Backup:    http://nadro-mentoria-frontend-qa.s3-website-us-east-1.amazonaws.com
```

---

## 🔧 Prerequisitos

### 1. Configurar Perfil AWS

```bash
# Crear perfil 'mentoria'
aws configure --profile mentoria

# Ingresar:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Default output: json
```

### 2. Verificar Perfil

```bash
# Ver perfil actual
aws configure list --profile mentoria

# Verificar identidad
aws sts get-caller-identity --profile mentoria
```

---

## 📦 Deployment Completo QA

### Paso 1: Deploy Backend

```bash
cd backend

# Instalar dependencias (solo primera vez)
npm install

# Desplegar a NADRO-QA
serverless deploy --stage nadro-qa --profile qa-nadro
```

**Salida esperada:**
```
✅ Service deployed to stack nadro-mentoria-api-nadro-qa

endpoints:
  ANY - https://xxxxx.execute-api.us-east-1.amazonaws.com/nadro-qa/{proxy+}

functions:
  api: nadro-mentoria-api-nadro-qa-api
```

**⚠️ IMPORTANTE:** Anota la URL del API (el `https://xxxxx...`)

---

### Paso 2: Configurar Frontend con la URL del Backend

Edita `frontend/src/services/api.js`:

```javascript
// Cambiar la URL del API según el ambiente
const API_BASE_URL = 'https://xxxxx.execute-api.us-east-1.amazonaws.com/nadro-qa/api';
//                    ↑ Usa la URL que obtuviste en el Paso 1
```

---

### Paso 3: Deploy Frontend

```bash
cd frontend

# Dar permisos de ejecución (solo primera vez)
chmod +x deploy-nadro-qa-cloudfront.sh

# Desplegar a NADRO-QA (con CloudFront)
./deploy-nadro-qa-cloudfront.sh
```

**Salida esperada:**
```
✅ DESPLIEGUE NADRO-QA COMPLETADO

🌐 URLs NADRO-QA:
   CloudFront (HTTPS): https://xxxxx.cloudfront.net
   S3 Backup (HTTP):   http://nadro-mentoria-frontend-nadro-qa.s3-website-us-east-1.amazonaws.com
```

---

## 🧪 Verificación Post-Deployment

### 1. Backend - Verificar API

```bash
# Info del deployment
serverless info --stage nadro-qa --profile qa-nadro

# Ver logs
serverless logs -f api --stage nadro-qa --profile qa-nadro
```

### 2. Frontend - Verificar S3

```bash
# Listar archivos en el bucket
aws s3 ls s3://nadro-mentoria-frontend-qa/ --profile qa-nadro

# Ver URL del bucket
aws s3 website s3://nadro-mentoria-frontend-qa --profile qa-nadro
```

### 3. Crear Usuario Admin de Prueba

```bash
cd infrastructure

# Editar create-initial-user.js y cambiar:
# - STAGE a 'nadro-qa'
# - USER_POOL_ID al nuevo pool de nadro-qa

node create-initial-user.js
```

---

## 🔄 Re-deployment (Updates)

### Backend Only
```bash
cd backend
serverless deploy --stage nadro-qa --profile qa-nadro
```

### Frontend Only
```bash
cd frontend
./deploy-nadro-qa-cloudfront.sh
```

### Ambos (Full Update)
```bash
# Backend
cd backend && serverless deploy --stage nadro-qa --profile qa-nadro

# Frontend
cd ../frontend && ./deploy-nadro-qa-cloudfront.sh
```

---

## 🗑️ Eliminar Ambiente QA

```bash
# Backend (elimina Lambda, API Gateway, DynamoDB, Cognito)
cd backend
serverless remove --stage nadro-qa --profile qa-nadro

# Frontend - Primero eliminar CloudFront
# 1. Obtener Distribution ID
aws cloudfront list-distributions --profile qa-nadro --query "DistributionList.Items[?Comment=='Nadro Mentoria Frontend - QA'].Id" --output text

# 2. Desactivar distribución (reemplaza DISTRIBUTION_ID)
aws cloudfront get-distribution-config --id DISTRIBUTION_ID --profile qa-nadro > /tmp/cf-config.json
# Editar /tmp/cf-config.json y cambiar "Enabled": true a "Enabled": false
aws cloudfront update-distribution --id DISTRIBUTION_ID --if-match ETAG --distribution-config file:///tmp/cf-config.json --profile qa-nadro

# 3. Esperar a que se desactive (puede tardar 10-15 min)
# 4. Eliminar distribución
aws cloudfront delete-distribution --id DISTRIBUTION_ID --if-match ETAG --profile qa-nadro

# Frontend - Eliminar bucket S3
cd frontend
aws s3 rb s3://nadro-mentoria-frontend-qa --force --profile qa-nadro
```

---

## 📊 Comparación de Ambientes

### DEV (dev-jul) - Tu ambiente personal
```bash
# Backend
cd backend && npm run deploy:dev

# Frontend
cd frontend && ./deploy-frontend.sh dev-jul mentoria
```

### QA (qa) - Testing oficial
```bash
# Backend
cd backend && npm run deploy:qa

# Frontend
cd frontend && ./deploy-qa.sh
```

### PROD (prod) - Producción
```bash
# Backend
cd backend && npm run deploy:prod

# Frontend
cd frontend && ./deploy-cloudfront.sh  # Usa CloudFront
```

---

## 🐛 Troubleshooting

### Error: "Profile 'mentoria' not found"

```bash
# Crear el perfil
aws configure --profile mentoria
```

### Error: "Bucket already exists"

```bash
# El bucket ya fue creado antes, solo sube archivos
cd frontend
aws s3 sync build/ s3://nadro-mentoria-frontend-qa --delete --profile mentoria
```

### Error: "Access Denied"

```bash
# Verificar que el perfil tenga permisos
aws sts get-caller-identity --profile qa-nadro
```

### Backend desplegado pero Frontend no conecta

1. Verifica la URL en `frontend/src/services/api.js`
2. Debe terminar en `/api` (no `/nadro-qa` solo)
3. Ejemplo correcto: `https://xxxxx.execute-api.us-east-1.amazonaws.com/nadro-qa/api`

---

## 📝 Checklist de Deployment

### Primera vez (Setup completo)

- [ ] Crear perfil AWS `mentoria`
- [ ] Deploy backend QA: `npm run deploy:qa`
- [ ] Anotar URL del API
- [ ] Actualizar `frontend/src/services/api.js` con URL del API
- [ ] Dar permisos al script: `chmod +x deploy-qa.sh`
- [ ] Deploy frontend QA: `./deploy-qa.sh`
- [ ] Crear usuario admin en Cognito
- [ ] Probar login en la URL del frontend

### Actualizaciones

- [ ] Deploy backend (si cambió): `npm run deploy:qa`
- [ ] Deploy frontend: `./deploy-qa.sh`
- [ ] Verificar que todo funcione

---

## 🎯 URLs Finales

Después del deployment, tendrás:

```
Backend API:  https://xxxxx.execute-api.us-east-1.amazonaws.com/nadro-qa/api
Frontend:     https://xxxxx.cloudfront.net (CloudFront - HTTPS)
              http://nadro-mentoria-frontend-qa.s3-website-us-east-1.amazonaws.com (S3 Backup)
Login Admin:  https://xxxxx.cloudfront.net/#/admin/login
```

---

## 💡 Tips

1. **Siempre despliega backend primero**, luego frontend
2. **Usa el mismo perfil** (`mentoria`) para todos los ambientes
3. **Anota las URLs** después de cada deployment
4. **Prueba el login** inmediatamente después del deployment
5. **Los logs** se pueden ver con `npm run logs:qa`

---

**Creado:** $(date)  
**Última actualización:** $(date)

