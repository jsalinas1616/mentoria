# 🌐 URLs de Producción - Nadro Mentoría

## ✅ Sistema Desplegado Exitosamente

El sistema completo está ahora funcionando en AWS.

---

## 🔗 URLs de Acceso

### Frontend (Aplicación Web)
**URL:** http://nadro-mentoria-frontend-2024.s3-website-us-east-1.amazonaws.com

**Credenciales de acceso:**
- Email: `admin@nadro.com`
- Password: `admin123`

⚠️ **IMPORTANTE:** Cambia estas credenciales después del primer login

---

### Backend API
**URL Base:** https://g6eh2ci3pf.execute-api.us-east-1.amazonaws.com

**Endpoints principales:**
- Health Check: https://g6eh2ci3pf.execute-api.us-east-1.amazonaws.com/api/health
- Login: https://g6eh2ci3pf.execute-api.us-east-1.amazonaws.com/api/auth/login
- Consultas: https://g6eh2ci3pf.execute-api.us-east-1.amazonaws.com/api/consultas
- Dashboard: https://g6eh2ci3pf.execute-api.us-east-1.amazonaws.com/api/dashboard/stats

---

## 🗄️ Base de Datos (DynamoDB)

**Tablas creadas:**
- `NadroMentoria-Consultas` (para guardar consultas)
- `NadroMentoria-Usuarios` (para autenticación)

**Región:** us-east-1

---

## 🚀 Recursos AWS Desplegados

| Recurso | Nombre | Estado |
|---------|--------|--------|
| S3 Bucket | nadro-mentoria-frontend-2024 | ✅ Activo |
| Lambda Function | nadro-mentoria-api-dev-api | ✅ Activo |
| API Gateway | g6eh2ci3pf.execute-api.us-east-1.amazonaws.com | ✅ Activo |
| DynamoDB Table | NadroMentoria-Consultas | ✅ Activa |
| DynamoDB Table | NadroMentoria-Usuarios | ✅ Activa |

---

## 🧪 Probar el Sistema

### 1. Verificar Backend (Health Check)
```bash
curl https://g6eh2ci3pf.execute-api.us-east-1.amazonaws.com/api/health
```

Respuesta esperada:
```json
{"status":"OK","message":"Nadro Mentoría API funcionando correctamente"}
```

### 2. Probar Login
```bash
curl -X POST https://g6eh2ci3pf.execute-api.us-east-1.amazonaws.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nadro.com","password":"admin123"}'
```

### 3. Abrir Frontend
Abre en tu navegador:
```
http://nadro-mentoria-frontend-2024.s3-website-us-east-1.amazonaws.com
```

---

## 📊 Costos Estimados

Con el uso esperado, los costos mensuales serán:

| Servicio | Costo Estimado |
|----------|----------------|
| Lambda | ~$0.20/mes |
| API Gateway | ~$0.35/mes |
| DynamoDB | ~$0.25/mes |
| S3 | ~$0.05/mes |
| **Total** | **~$0.85/mes** |

💡 Si estás dentro del primer año de AWS, todo podría estar cubierto por la capa gratuita.

---

## 🔐 Seguridad

### Configuración Actual:
- ✅ Autenticación JWT
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Comunicación HTTPS en API
- ✅ Permisos IAM mínimos necesarios

### Próximos Pasos Recomendados:
1. Cambiar credenciales de admin
2. Configurar dominio personalizado (opcional)
3. Habilitar CloudFront para HTTPS en frontend (opcional)
4. Configurar alertas de CloudWatch
5. Habilitar backups automáticos de DynamoDB

---

## 📝 Actualizar el Sistema

### Actualizar Backend:
```bash
cd backend
npm run deploy
```

### Actualizar Frontend:
```bash
cd frontend
REACT_APP_API_URL=https://g6eh2ci3pf.execute-api.us-east-1.amazonaws.com/api npm run build
aws s3 sync build/ s3://nadro-mentoria-frontend-2024 --delete
```

---

## 🗑️ Eliminar Todo (si es necesario)

```bash
# Eliminar backend
cd backend
serverless remove

# Vaciar y eliminar bucket S3
aws s3 rm s3://nadro-mentoria-frontend-2024 --recursive
aws s3 rb s3://nadro-mentoria-frontend-2024

# Eliminar tablas DynamoDB
aws dynamodb delete-table --table-name NadroMentoria-Consultas
aws dynamodb delete-table --table-name NadroMentoria-Usuarios
```

---

## 📞 Soporte

Para ver logs y diagnosticar problemas:

```bash
# Ver logs de Lambda
serverless logs -f api -t

# Ver datos en DynamoDB
aws dynamodb scan --table-name NadroMentoria-Consultas
```

---

## ✅ Checklist Post-Deployment

- [x] Backend desplegado y funcionando
- [x] Frontend desplegado y accesible
- [x] Tablas DynamoDB creadas
- [x] Usuario inicial creado
- [ ] Credenciales cambiadas
- [ ] Sistema probado end-to-end
- [ ] Equipo notificado con URLs
- [ ] Documentación actualizada

---

**¡El sistema está listo para usar!** 🎉

Fecha de deployment: Octubre 10, 2024
Versión: 1.0.0


