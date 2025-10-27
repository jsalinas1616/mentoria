# URLs de Producción - Nadro Mentoría

## 🌐 Frontend

### URL Principal (CloudFront con HTTPS)
**https://d2y013h5yg35nu.cloudfront.net**
- ✅ HTTPS habilitado
- ✅ CDN global (CloudFront)
- ✅ Certificado SSL incluido
- 🔧 CloudFront ID: E26HPGOKVFK2W3

### URL Alternativa (S3 Website - Solo HTTP)
**http://nadro-mentoria-frontend-1760378806.s3-website-us-east-1.amazonaws.com**
- ⚠️ Solo HTTP (sin SSL)
- 📦 Bucket S3: nadro-mentoria-frontend-1760378806

---

## 🔧 Backend API

### Endpoint Principal
**https://6qdwpptw76.execute-api.us-east-1.amazonaws.com/prod**

### Endpoints disponibles:
- `POST /auth/login` - Login
- `POST /auth/change-password` - Cambiar contraseña
- `GET /auth/me` - Usuario actual
- `POST /consultas` - Crear consulta
- `GET /consultas` - Listar consultas
- `GET /consultas/:id` - Ver consulta
- `PUT /consultas/:id` - Actualizar consulta
- `DELETE /consultas/:id` - Eliminar consulta
- `POST /capacitaciones` - Crear capacitación
- `GET /capacitaciones` - Listar capacitaciones
- `GET /capacitaciones/:id` - Ver capacitación
- `PUT /capacitaciones/:id` - Actualizar capacitación
- `DELETE /capacitaciones/:id` - Eliminar capacitación
- `GET /dashboard/stats` - Estadísticas del dashboard

---

## 🔐 Cognito

### User Pool
- **ID:** us-east-1_B7v3pO3rF
- **Región:** us-east-1
- **Nombre:** nadro-mentoria-users

### App Client
- **ID:** 3oqrdbvg4cg3l8s9iaupp2qvd5

---

## 📊 Base de Datos (DynamoDB)

### Tablas:
- `NadroMentoria-Consultas` - Almacena las consultas/mentorías
- `NadroMentoria-Capacitaciones` - Almacena las capacitaciones grupales
- `NadroMentoria-Empleados` - Información de empleados

---

## 🚀 Despliegue

### Frontend
```bash
cd frontend
npm run build
aws s3 sync build/ s3://nadro-mentoria-frontend-1760378806 --delete
aws cloudfront create-invalidation --distribution-id E26HPGOKVFK2W3 --paths "/*"
```

### Backend
```bash
cd backend
npm run deploy
```

---

## 📝 Notas

- **Fecha de creación CloudFront:** 25 de octubre de 2025
- **Región principal:** us-east-1 (N. Virginia)
- **Tiempo de despliegue CloudFront:** 5-15 minutos
- **Caché de CloudFront:** 24 horas por defecto

---

## ✅ Estado de Servicios

| Servicio | Estado | URL |
|----------|--------|-----|
| Frontend (CloudFront) | 🟢 Activo | https://d2y013h5yg35nu.cloudfront.net |
| Backend API | 🟢 Activo | https://6qdwpptw76.execute-api.us-east-1.amazonaws.com/prod |
| Cognito | 🟢 Activo | us-east-1_B7v3pO3rF |
| DynamoDB | 🟢 Activo | Tablas creadas |

---

**Última actualización:** 25 de octubre de 2025

