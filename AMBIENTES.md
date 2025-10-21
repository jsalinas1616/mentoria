# 🌐 Ambientes de Nadro Mentoría

## 📋 **Estructura de Ambientes**

### **QA (Actual - EN REVISIÓN - NO TOCAR)** ⚠️
- **Frontend:** `nadro-mentoria-frontend-1760378806` (S3)
- **Backend:** `nadro-mentoria-api-dev-api` (Lambda)
- **API Gateway:** `nadro-mentoria-api-dev`
- **DynamoDB:** `NadroMentoria-Consultas-dev`
- **URL Frontend:** https://nadro-mentoria-frontend-1760378806.s3.us-east-1.amazonaws.com
- **URL Backend:** `https://dev-api.execute-api.us-east-1.amazonaws.com/dev/`
- **Estado:** ✅ En revisión - NO MODIFICAR

### **DEV-JUL (Nuevo)** 🆕
- **Frontend:** `nadro-mentoria-frontend-dev-jul` (S3)
- **Backend:** `nadro-mentoria-api-dev-jul-api` (Lambda)
- **API Gateway:** `nadro-mentoria-api-dev-jul`
- **DynamoDB:** `NadroMentoria-Consultas-dev-jul`
- **URL Frontend:** `https://nadro-mentoria-frontend-dev-jul.s3.us-east-1.amazonaws.com`
- **URL Backend:** `https://dev-jul-api.execute-api.us-east-1.amazonaws.com/dev-jul/`
- **Estado:** 🚧 Por crear

### **PRODUCCIÓN (Nuevo)** 🆕
- **Frontend:** `nadro-mentoria-frontend-prod` (S3)
- **Backend:** `nadro-mentoria-api-prod-api` (Lambda)
- **API Gateway:** `nadro-mentoria-api-prod`
- **DynamoDB:** `NadroMentoria-Consultas-prod`
- **URL Frontend:** `https://nadro-mentoria-frontend-prod.s3.us-east-1.amazonaws.com`
- **URL Backend:** `https://prod-api.execute-api.us-east-1.amazonaws.com/prod/`
- **Estado:** 🚧 Por crear

## 🚀 **Comandos de Despliegue**

### **QA (Actual):**
```bash
npm run deploy:qa
# Despliega a stage "dev" (que es QA)
```

### **DEV-JUL (Nuevo):**
```bash
npm run deploy:dev
# Despliega a stage "dev-jul"
```

### **PRODUCCIÓN (Nuevo):**
```bash
npm run deploy:desarrollo
# Despliega a stage "prod"
```

## 🔍 **Comandos de Información**

### **Ver información de cada ambiente:**
```bash
npm run info:qa          # Info de QA
npm run info:dev          # Info de DEV-JUL
npm run info:desarrollo   # Info de PRODUCCIÓN
```

### **Ver logs de cada ambiente:**
```bash
npm run logs:qa           # Logs de QA
npm run logs:dev          # Logs de DEV-JUL
npm run logs:desarrollo   # Logs de PRODUCCIÓN
```

## 🗑️ **Comandos de Eliminación**

### **Eliminar ambientes (CUIDADO):**
```bash
npm run remove:qa         # Eliminar QA (NO HACER)
npm run remove:dev        # Eliminar DEV
npm run remove:desarrollo # Eliminar DESARROLLO
```

## 🔒 **Variables de Entorno por Ambiente**

### **QA:**
```env
NODE_ENV=dev
JWT_SECRET=qa-secret-key
CONSULTAS_TABLE=NadroMentoria-Consultas-dev
USUARIOS_TABLE=NadroMentoria-Usuarios-dev
```

### **DEV-JUL:**
```env
NODE_ENV=dev-jul
JWT_SECRET=dev-jul-secret-key
CONSULTAS_TABLE=NadroMentoria-Consultas-dev-jul
USUARIOS_TABLE=NadroMentoria-Usuarios-dev-jul
```

### **PRODUCCIÓN:**
```env
NODE_ENV=prod
JWT_SECRET=prod-secret-key
CONSULTAS_TABLE=NadroMentoria-Consultas-prod
USUARIOS_TABLE=NadroMentoria-Usuarios-prod
```

## ⚠️ **IMPORTANTE**

- **QA está en revisión** - NO MODIFICAR NADA
- **Crear solo DEV-JUL y PRODUCCIÓN** nuevos
- **Cada ambiente tiene recursos completamente separados**
- **Variables de entorno diferentes por ambiente**

## 🎯 **Próximos Pasos**

1. ✅ Scripts actualizados
2. 🚧 Crear ambiente DEV-JUL
3. 🚧 Crear ambiente PRODUCCIÓN
4. 🚧 Configurar variables de entorno
5. 🚧 Probar despliegues

---

**Creado:** $(date)
**Estado:** En desarrollo
