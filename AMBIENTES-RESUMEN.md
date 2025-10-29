# 📊 Resumen de Ambientes - Nadro Mentoría

## 🎯 Tabla de Ambientes

| Ambiente | Stage | Propósito | Profile AWS | Deploy Frontend |
|----------|-------|-----------|-------------|-----------------|
| **NADRO-QA** | `nadro-qa` | Testing oficial | `qa-nadro` | `./deploy-nadro-qa-cloudfront.sh` |
| **DEV** | `dev-jul` | Desarrollo Julian | `mentoria` | `./deploy-frontend.sh dev-jul mentoria` |
| **PROD** | `prod` | Producción | `mentoria` | `./deploy-cloudfront.sh` |

---

## 🔗 Nomenclatura de Recursos

### QA (`nadro-qa`) 🧪
```
Backend:
  Service:     nadro-mentoria-api-nadro-qa
  Lambda:      nadro-mentoria-api-nadro-qa-api
  API URL:     https://xxxxx.execute-api.us-east-1.amazonaws.com/nadro-qa/api
  DynamoDB:    NadroMentoria-Consultas-nadro-qa
               NadroMentoria-Usuarios-nadro-qa
               NadroMentoria-Capacitaciones-nadro-qa
  Cognito:     NadroMentoria-UserPool-nadro-qa

Frontend:
  Bucket:      nadro-mentoria-frontend-qa
  CloudFront:  https://xxxxx.cloudfront.net
  S3 Backup:   http://nadro-mentoria-frontend-qa.s3-website-us-east-1.amazonaws.com
```

### DEV (`dev-jul`) 👨‍💻
```
Backend:
  Service:     nadro-mentoria-api-dev-jul
  Lambda:      nadro-mentoria-api-dev-jul-api
  API URL:     https://xxxxx.execute-api.us-east-1.amazonaws.com/dev-jul/api
  DynamoDB:    NadroMentoria-Consultas-dev-jul
               NadroMentoria-Usuarios-dev-jul
               NadroMentoria-Capacitaciones-dev-jul
  Cognito:     NadroMentoria-UserPool-dev-jul

Frontend:
  Bucket:      nadro-mentoria-frontend-dev-jul
  URL:         http://nadro-mentoria-frontend-dev-jul.s3-website-us-east-1.amazonaws.com
```

### PROD (`prod`) 🚀
```
Backend:
  Service:     nadro-mentoria-api-prod
  Lambda:      nadro-mentoria-api-prod-api
  API URL:     https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/api
  DynamoDB:    NadroMentoria-Consultas-prod
               NadroMentoria-Usuarios-prod
               NadroMentoria-Capacitaciones-prod
  Cognito:     NadroMentoria-UserPool-prod

Frontend:
  Bucket:      nadro-mentoria-frontend-1760378806
  CloudFront:  https://d2y013h5yg35nu.cloudfront.net
```

---

## 🚀 Comandos Rápidos

### NADRO-QA
```bash
# Backend
cd backend && serverless deploy --stage nadro-qa --profile qa-nadro

# Frontend (con CloudFront)
cd frontend && ./deploy-nadro-qa-cloudfront.sh

# Ver info
cd backend && serverless info --stage nadro-qa --profile qa-nadro
```

### DEV (dev-jul)
```bash
# Backend
cd backend && serverless deploy --stage dev-jul --profile mentoria

# Frontend
cd frontend && ./deploy-frontend.sh dev-jul mentoria

# Ver info
cd backend && serverless info --stage dev-jul --profile mentoria
```

### PROD (prod)
```bash
# Backend
cd backend && serverless deploy --stage prod --profile mentoria

# Frontend (con CloudFront)
cd frontend && ./deploy-cloudfront.sh

# Ver info
cd backend && serverless info --stage prod --profile mentoria
```

---

## 📋 Profile AWS

Todos los ambientes usan el mismo perfil:

```bash
Profile: mentoria
Region:  us-east-1
```

---

## 🎨 Visualización de Ambientes

```
┌─────────────────────────────────────────────────────────┐
│                    NADRO MENTORÍA                       │
│                 Arquitectura Serverless                  │
└─────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 🧪 NADRO-QA  │  │ 👨‍💻 DEV      │  │  🚀 PROD     │
│  nadro-qa    │  │  dev-jul     │  │   prod       │
└──────────────┘  └──────────────┘  └──────────────┘
       │                 │                  │
       ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  S3 Bucket   │  │  S3 Bucket   │  │ CloudFront + │
│              │  │              │  │  S3 Bucket   │
└──────────────┘  └──────────────┘  └──────────────┘
       │                 │                  │
       ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ API Gateway  │  │ API Gateway  │  │ API Gateway  │
└──────────────┘  └──────────────┘  └──────────────┘
       │                 │                  │
       ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Lambda     │  │   Lambda     │  │   Lambda     │
└──────────────┘  └──────────────┘  └──────────────┘
       │                 │                  │
       ├─────────────────┼──────────────────┤
       ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  DynamoDB    │  │  DynamoDB    │  │  DynamoDB    │
│  - Consultas │  │  - Consultas │  │  - Consultas │
│  - Usuarios  │  │  - Usuarios  │  │  - Usuarios  │
│  - Capacit.  │  │  - Capacit.  │  │  - Capacit.  │
└──────────────┘  └──────────────┘  └──────────────┘
       │                 │                  │
       ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Cognito    │  │   Cognito    │  │   Cognito    │
│  User Pool   │  │  User Pool   │  │  User Pool   │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 📝 Notas

- **Aislamiento Total:** Cada ambiente tiene sus propios recursos (DynamoDB, Cognito, etc.)
- **Sin Conflictos:** Puedes desplegar en un ambiente sin afectar los otros
- **Testing Seguro:** NADRO-QA es perfecto para probar sin riesgo a producción
- **Desarrollo Libre:** DEV es tu ambiente personal para experimentar

---

**Última actualización:** $(date)

