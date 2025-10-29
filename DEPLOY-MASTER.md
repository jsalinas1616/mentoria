# 🎯 MASTER DE DEPLOYMENT - Nadro Mentoría

## 📁 Archivos de Deployment

| Archivo | Propósito | Ubicación |
|---------|-----------|-----------|
| **DEPLOY-NADRO-QA.md** | Guía completa para NADRO-QA | `/` |
| **AMBIENTES-RESUMEN.md** | Tabla comparativa de ambientes | `/` |
| **deploy-frontend-nadro-qa.sh** | Script frontend NADRO-QA (S3) | `/frontend/` |
| **deploy-frontend.sh** | Script frontend DEV (S3) | `/frontend/` |
| **deploy-cloudfront.sh** | Script frontend PROD (CloudFront + S3) | `/frontend/` |

---

## 🎯 Deployment por Ambiente

### 🧪 NADRO-QA (Testing)
```bash
# 1. Backend
cd backend
serverless deploy --stage nadro-qa --profile qa-nadro

# 2. Frontend (S3)
cd ../frontend
./deploy-frontend-nadro-qa.sh
```

**Recursos creados:**
- Stage: `nadro-qa`
- Bucket: `nadro-mentoria-frontend-qa` (S3 solo)
- API: `nadro-mentoria-api-nadro-qa`
- DynamoDB: `NadroMentoria-*-nadro-qa`
- Cognito: `NadroMentoria-UserPool-nadro-qa`

**Documentación:** `DEPLOY-NADRO-QA.md`

---

### 👨‍💻 DEV (Desarrollo Julian)
```bash
# 1. Backend
cd backend
serverless deploy --stage dev-jul --profile mentoria

# 2. Frontend
cd ../frontend
./deploy-frontend.sh dev-jul mentoria
```

**Recursos creados:**
- Stage: `dev-jul`
- Bucket: `nadro-mentoria-frontend-dev-jul`
- API: `nadro-mentoria-api-dev-jul`
- DynamoDB: `NadroMentoria-*-dev-jul`
- Cognito: `NadroMentoria-UserPool-dev-jul`

---

### 🚀 PROD (Producción)
```bash
# 1. Backend
cd backend
serverless deploy --stage prod --profile mentoria

# 2. Frontend (con CloudFront)
cd ../frontend
./deploy-cloudfront.sh
```

**Recursos creados:**
- Stage: `prod`
- Bucket: `nadro-mentoria-frontend-1760378806`
- CloudFront: `https://d2y013h5yg35nu.cloudfront.net`
- API: `nadro-mentoria-api-prod`
- DynamoDB: `NadroMentoria-*-prod`
- Cognito: `NadroMentoria-UserPool-prod`

---

## 🗂️ Estructura de Nombres

### Backend (Serverless)
```
Patrón: nadro-mentoria-api-{STAGE}

Ejemplos:
  NADRO-QA → nadro-mentoria-api-nadro-qa
  DEV      → nadro-mentoria-api-dev-jul
  PROD     → nadro-mentoria-api-prod
```

### Frontend (S3)
```
Patrón: nadro-mentoria-frontend-{STAGE}

Ejemplos:
  NADRO-QA → nadro-mentoria-frontend-qa
  DEV      → nadro-mentoria-frontend-dev-jul
  PROD     → nadro-mentoria-frontend-1760378806 (custom)
```

### DynamoDB
```
Patrón: NadroMentoria-{TABLA}-{STAGE}

Ejemplos:
  NADRO-QA → NadroMentoria-Consultas-nadro-qa
  DEV      → NadroMentoria-Consultas-dev-jul
  PROD     → NadroMentoria-Consultas-prod
```

### Cognito
```
Patrón: NadroMentoria-UserPool-{STAGE}

Ejemplos:
  NADRO-QA → NadroMentoria-UserPool-nadro-qa
  DEV      → NadroMentoria-UserPool-dev-jul
  PROD     → NadroMentoria-UserPool-prod
```

---

## 📋 Comandos Rápidos

### Ver Info de Ambientes
```bash
cd backend

# NADRO-QA
serverless info --stage nadro-qa --profile qa-nadro

# DEV
serverless info --stage dev-jul --profile mentoria

# PROD
serverless info --stage prod --profile mentoria
```

### Ver Logs
```bash
cd backend

# NADRO-QA
serverless logs -f api --stage nadro-qa --profile qa-nadro

# DEV
serverless logs -f api --stage dev-jul --profile mentoria

# PROD
serverless logs -f api --stage prod --profile mentoria
```

### Eliminar Ambiente
```bash
cd backend

# NADRO-QA
serverless remove --stage nadro-qa --profile qa-nadro

# DEV
serverless remove --stage dev-jul --profile mentoria

# PROD (¡CUIDADO!)
serverless remove --stage prod --profile mentoria
```

---

## 🔑 AWS Profiles

Cada ambiente usa su propio perfil:
```
NADRO-QA: qa-nadro
DEV:      mentoria
PROD:     mentoria
```

Verificar credenciales:
```bash
# NADRO-QA
aws sts get-caller-identity --profile qa-nadro

# DEV/PROD
aws sts get-caller-identity --profile mentoria
```

---

## 📚 Documentación Relacionada

- **DEPLOY-NADRO-QA.md** - Guía paso a paso para NADRO-QA
- **AMBIENTES-RESUMEN.md** - Comparación de ambientes
- **serverless.yml** - Configuración de backend
- **package.json** - Scripts de deployment

---

## 🎨 Mapa Visual

```
┌─────────────────────────────────────────┐
│        NADRO MENTORÍA                   │
│     Sistema de Deployment               │
└─────────────────────────────────────────┘

          🧪 NADRO-QA          
          (nadro-qa)           
               │                
       ┌───────┴───────┐       
       │               │       
   Frontend        Backend     
(deploy-nadro-qa.sh) (npm:qa)  
       │               │       
       ▼               ▼       
   S3 Bucket      API Gateway  
       │               │       
       └───────┬───────┘       
               │                
               ▼                
          DynamoDB              
          Cognito               

         👨‍💻 DEV-JUL          
         (dev-jul)            
               │                
       ┌───────┴───────┐       
       │               │       
   Frontend        Backend     
(deploy-frontend.sh) (npm:dev) 
       │               │       
       ▼               ▼       
   S3 Bucket      API Gateway  
       │               │       
       └───────┬───────┘       
               │                
               ▼                
          DynamoDB              
          Cognito               

          🚀 PROD              
          (prod)               
               │                
       ┌───────┴───────┐       
       │               │       
   Frontend        Backend     
(deploy-cloudfront.sh)(npm:prod)
       │               │       
       ▼               ▼       
   CloudFront     API Gateway  
       │               │       
   S3 Bucket           │       
       │               │       
       └───────┬───────┘       
               │                
               ▼                
          DynamoDB              
          Cognito               
```

---

## ✅ Checklist de Deployment

### Antes de Desplegar
- [ ] Código probado localmente
- [ ] AWS CLI instalado
- [ ] Profile `mentoria` configurado
- [ ] Variables de entorno correctas

### NADRO-QA
- [ ] Backend desplegado: `npm run deploy:qa`
- [ ] URL del API anotada
- [ ] Frontend actualizado con URL del API
- [ ] Frontend desplegado: `./deploy-nadro-qa.sh`
- [ ] Usuario admin creado en Cognito
- [ ] Login probado

### DEV
- [ ] Backend desplegado: `npm run deploy:dev`
- [ ] Frontend desplegado: `./deploy-frontend.sh dev-jul mentoria`
- [ ] Usuario admin creado
- [ ] Login probado

### PROD
- [ ] Backup de DynamoDB
- [ ] Backend desplegado: `npm run deploy:prod`
- [ ] Frontend desplegado: `./deploy-cloudfront.sh`
- [ ] CloudFront invalidado
- [ ] Login probado
- [ ] Usuarios notificados

---

## 🆘 Enlaces de Ayuda

- AWS CLI: `aws configure --profile mentoria`
- Serverless: `serverless --help`
- Node/NPM: `node --version`, `npm --version`

---

**Última actualización:** Octubre 2025
**Autor:** Sistema de Mentoría Nadro

