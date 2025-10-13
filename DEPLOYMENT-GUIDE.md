# 🚀 Guía de Deployment - Nadro Mentoría

Esta guía te llevará paso a paso para desplegar el sistema completo en AWS.

## 📋 Pre-requisitos

✅ Cuenta de AWS activa
✅ AWS CLI instalado y configurado
✅ Node.js 18+ instalado
✅ Permisos de AWS para:
   - Lambda
   - API Gateway
   - DynamoDB
   - S3
   - CloudFront
   - IAM

## 🎯 Arquitectura de Deployment

```
Frontend → S3 → CloudFront → Usuario
Backend → Lambda → API Gateway → Usuario
Base de Datos → DynamoDB
```

---

## Paso 1: Configurar AWS CLI

```bash
aws configure

# Ingresa:
# AWS Access Key ID: [tu-access-key]
# AWS Secret Access Key: [tu-secret-key]
# Default region name: us-east-1
# Default output format: json
```

### Verificar configuración:
```bash
aws sts get-caller-identity
```

---

## Paso 2: Desplegar Backend (Lambda + API Gateway + DynamoDB)

### 2.1 Instalar dependencias
```bash
cd backend
npm install
```

### 2.2 Configurar variables de entorno
Crea archivo `backend/.env`:
```env
JWT_SECRET=tu-secret-key-super-seguro-aqui
```

### 2.3 Desplegar con Serverless
```bash
# Development
npm run deploy

# Production
serverless deploy --stage prod
```

### 2.4 Obtener URL del API
Después del deploy, Serverless mostrará:
```
endpoints:
  ANY - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
```

**Guarda esta URL**, la necesitarás para el frontend.

### 2.5 Crear tablas e usuario inicial
```bash
cd ../infrastructure
npm install
npm run setup
```

### 2.6 Verificar que funciona
```bash
curl https://tu-api-url/api/health
```

Deberías ver:
```json
{"status":"OK","message":"Nadro Mentoría API funcionando correctamente"}
```

---

## Paso 3: Desplegar Frontend (S3 + CloudFront)

### 3.1 Crear bucket S3

```bash
# Reemplaza 'nadro-mentoria-frontend' con tu nombre único
aws s3 mb s3://nadro-mentoria-frontend --region us-east-1
```

### 3.2 Configurar bucket para hosting
```bash
aws s3 website s3://nadro-mentoria-frontend \
  --index-document index.html \
  --error-document index.html
```

### 3.3 Configurar política pública del bucket
Crea archivo `bucket-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::nadro-mentoria-frontend/*"
    }
  ]
}
```

Aplica la política:
```bash
aws s3api put-bucket-policy \
  --bucket nadro-mentoria-frontend \
  --policy file://bucket-policy.json
```

### 3.4 Configurar variables de entorno del frontend
Edita `frontend/.env`:
```env
REACT_APP_API_URL=https://tu-api-gateway-url/dev/api
```

### 3.5 Build y deploy
```bash
cd frontend
npm install
npm run build

# Subir a S3
aws s3 sync build/ s3://nadro-mentoria-frontend --delete
```

### 3.6 Obtener URL del sitio
```bash
echo "http://nadro-mentoria-frontend.s3-website-us-east-1.amazonaws.com"
```

---

## Paso 4: Configurar CloudFront (CDN) - OPCIONAL pero recomendado

### 4.1 Crear distribución CloudFront
```bash
aws cloudfront create-distribution \
  --origin-domain-name nadro-mentoria-frontend.s3.us-east-1.amazonaws.com \
  --default-root-object index.html
```

### 4.2 Configurar certificado SSL (si tienes dominio)
1. Ve a AWS Certificate Manager
2. Solicita certificado para tu dominio
3. Verifica el dominio
4. Asocia el certificado a CloudFront

### 4.3 Configurar dominio personalizado
1. Ve a Route 53
2. Crea registro A apuntando a CloudFront
3. Espera propagación DNS (15-30 min)

---

## Paso 5: Verificación Post-Deployment

### Backend ✅
```bash
# Health check
curl https://tu-api-url/api/health

# Login test
curl -X POST https://tu-api-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nadro.com","password":"admin123"}'
```

### Frontend ✅
1. Abre la URL de tu sitio
2. Deberías ver la pantalla de login
3. Intenta hacer login con: `admin@nadro.com` / `admin123`
4. Deberías ver el dashboard

---

## 🔧 Comandos Útiles de Mantenimiento

### Ver logs de Lambda
```bash
serverless logs -f api -t
```

### Actualizar backend
```bash
cd backend
npm run deploy
```

### Actualizar frontend
```bash
cd frontend
npm run build
aws s3 sync build/ s3://nadro-mentoria-frontend --delete

# Si usas CloudFront, invalida el cache:
aws cloudfront create-invalidation \
  --distribution-id TU_DIST_ID \
  --paths "/*"
```

### Ver tablas DynamoDB
```bash
aws dynamodb list-tables

aws dynamodb describe-table --table-name NadroMentoria-Consultas
```

### Backup de datos
```bash
# Exportar consultas
aws dynamodb scan --table-name NadroMentoria-Consultas > backup-consultas.json

# Exportar usuarios
aws dynamodb scan --table-name NadroMentoria-Usuarios > backup-usuarios.json
```

---

## 🔐 Seguridad Post-Deployment

### 1. Cambiar credenciales iniciales
Inmediatamente después del primer login, crear nuevo usuario admin y eliminar el default.

### 2. Configurar WAF en API Gateway
```bash
# Proteger contra ataques comunes
aws wafv2 create-web-acl ...
```

### 3. Habilitar logging
```bash
# Habilitar logs de CloudWatch para Lambda
aws logs create-log-group --log-group-name /aws/lambda/nadro-mentoria-api
```

### 4. Configurar alertas
- CloudWatch Alarms para errores
- SNS para notificaciones
- Métricas de uso

---

## 💰 Costos Estimados (AWS)

| Servicio | Uso Estimado | Costo Mensual (USD) |
|----------|--------------|---------------------|
| Lambda | 100K requests | $0.20 |
| API Gateway | 100K requests | $0.35 |
| DynamoDB | 1GB storage | $0.25 |
| S3 | 1GB storage + requests | $0.05 |
| CloudFront | 10GB transferencia | $0.85 |
| **TOTAL** | | **~$1.70/mes** |

💡 **Capa gratuita:** Durante el primer año, AWS ofrece uso gratuito que podría cubrir todo el sistema.

---

## 🆘 Troubleshooting

### Error: "Module not found"
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Error: "Access Denied" en S3
Verifica la política del bucket y que sea público.

### Error: CORS en API
Asegúrate que CORS esté habilitado en API Gateway (Serverless lo hace automáticamente).

### Error: "Cannot connect to API"
1. Verifica que la URL del API esté correcta en `frontend/.env`
2. Reconstruye el frontend: `npm run build`
3. Re-sube a S3

### Lambda timeout
Aumenta el timeout en `serverless.yml`:
```yaml
provider:
  timeout: 30  # segundos
```

---

## 📊 Monitoreo

### CloudWatch Metrics
- Invocaciones de Lambda
- Latencia de API Gateway
- Errores 4xx/5xx
- Uso de DynamoDB

### Logs
```bash
# Ver logs en tiempo real
serverless logs -f api -t --stage prod
```

### Alarmas recomendadas
- Errores > 10 en 5 minutos
- Latencia > 3000ms
- Uso de DynamoDB > 80%

---

## 🔄 CI/CD (Opcional)

### GitHub Actions
Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        run: |
          cd backend
          npm install
          npm run deploy
      
      - name: Deploy Frontend
        run: |
          cd frontend
          npm install
          npm run build
          aws s3 sync build/ s3://nadro-mentoria-frontend
```

---

## ✅ Checklist de Deployment

Backend:
- [ ] Dependencias instaladas
- [ ] Variables de entorno configuradas
- [ ] Deploy ejecutado exitosamente
- [ ] Tablas DynamoDB creadas
- [ ] Usuario inicial creado
- [ ] Health check responde OK

Frontend:
- [ ] Dependencias instaladas
- [ ] URL del API configurada
- [ ] Build exitoso
- [ ] Subido a S3
- [ ] Sitio accesible
- [ ] Login funciona

Seguridad:
- [ ] Credenciales cambiadas
- [ ] HTTPS habilitado
- [ ] Logging activado
- [ ] Alarmas configuradas

Documentación:
- [ ] README actualizado con URLs de producción
- [ ] Equipo notificado
- [ ] Backup inicial creado

---

## 🎉 ¡Deployment Completo!

Tu sistema está ahora en producción y listo para usar. 

**URLs importantes:**
- Frontend: `https://tu-bucket.s3.amazonaws.com` o tu dominio
- API: `https://tu-api-id.execute-api.us-east-1.amazonaws.com/dev`

**Credenciales iniciales:**
- Email: admin@nadro.com
- Password: admin123 (¡CAMBIAR INMEDIATAMENTE!)

---

Para soporte o preguntas, consulta la documentación o contacta al equipo de desarrollo.

**¡Disfruta tu nuevo sistema de Nadro Mentoría! 🎊**


