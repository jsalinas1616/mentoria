# ⚠️ Consideraciones para Deploy a PRODUCCIÓN

## 🔐 Seguridad y Validaciones

### Antes del Deploy

1. **Autenticación MFA**
   ```bash
   aws-mfa --profile mentoria
   ```

2. **Verificar rama correcta**
   - Debe estar en `main` o `master`
   - Sin cambios sin commitear
   - Últimos cambios testeados

3. **Confirmar cuenta AWS correcta**
   - Cuenta: `975130647458`
   - El script valida automáticamente

## 🎯 Diferencias Clave: PRODUCCIÓN vs QA

| Aspecto | QA (qa-nadro) | PRODUCCIÓN (prod) |
|---------|---------------|-------------------|
| **Profile** | `qa-nadro` | `mentoria` |
| **Stage** | `qa` o `nadro-qa` | `prod` |
| **Bucket** | `nadro-mentoria-frontend-qa` | `nadro-mentoria-frontend-prod` |
| **Cuenta AWS** | Cuenta QA separada | `975130647458` |
| **Confirmaciones** | 1 confirmación | **3 confirmaciones** |
| **Backup** | No automático | ✅ **Backup automático** |
| **Cache** | Cache básico | **Cache optimizado** |
| **Validación rama** | No requerida | ✅ **Verifica main/master** |
| **npm install** | `npm install` | `npm ci` (determinista) |

## 📋 Checklist Pre-Deploy

### Frontend
- [ ] Código testeado en QA
- [ ] Variables de entorno correctas para PROD
- [ ] Build exitoso localmente
- [ ] Sin errores de linter/typescript
- [ ] Credenciales MFA activas

### Backend
- [ ] API desplegada en PROD
- [ ] Cognito configurado en PROD
- [ ] DynamoDB tables creadas en PROD
- [ ] Variables de entorno actualizadas
- [ ] Endpoints verificados

## 🚀 Comandos de Deploy

### 1. Frontend (primero)
```bash
cd frontend
./deploy-frontend-nadro-prod.sh
```

### 2. Backend (después)
```bash
cd backend
aws-mfa --profile mentoria  # Si las credenciales expiraron
npm run deploy:prod
```

## 🔒 Seguridad del Script de PRODUCCIÓN

### Validaciones Implementadas

1. **Triple Confirmación**
   - Confirmación inicial de PRODUCCIÓN
   - Verificación de rama Git
   - Confirmación final antes de subir archivos

2. **Backup Automático**
   - Se crea un backup completo antes de cada deploy
   - Guardado en `../backups/backup_YYYYMMDD_HHMMSS/`
   - Permite rollback rápido si algo falla

3. **Verificación de Cuenta AWS**
   - Valida que estés en la cuenta correcta
   - Previene deploys accidentales a cuenta incorrecta

4. **Cache Optimizado**
   - Assets estáticos: cache de 1 año (inmutable)
   - `index.html`: sin cache (siempre última versión)
   - Mejor rendimiento para usuarios

## 💾 Rollback en Caso de Problemas

### Opción 1: Usar el Backup Automático
```bash
cd frontend
BACKUP_DIR="../backups/backup_YYYYMMDD_HHMMSS"

# Ver backups disponibles
ls -la ../backups/

# Restaurar backup específico
aws s3 sync $BACKUP_DIR/ s3://nadro-mentoria-frontend-prod/ \
  --profile mentoria \
  --delete
```

### Opción 2: Revertir a Commit Anterior
```bash
cd frontend

# Ver últimos commits
git log --oneline -10

# Volver a commit anterior
git checkout <commit-hash>

# Redesplegar
./deploy-frontend-nadro-prod.sh
```

### Opción 3: Redesplegar QA a PROD (emergencia)
```bash
# Si QA está funcionando bien, copia ese código
git checkout main
git pull origin main
cd frontend
./deploy-frontend-nadro-prod.sh
```

## 📊 Monitoreo Post-Deploy

### Inmediatamente Después del Deploy

1. **Verificar la App**
   ```bash
   # URL de producción
   open http://nadro-mentoria-frontend-prod.s3-website-us-east-1.amazonaws.com
   ```

2. **Probar Login**
   - Usar cuenta de prueba
   - Verificar que carga el dashboard
   - Probar funcionalidades críticas

3. **Verificar Backend**
   ```bash
   # Ver logs de Lambda en tiempo real
   serverless logs -f api --tail --stage prod --profile mentoria
   ```

4. **Revisar CloudWatch**
   - Errores en Lambda
   - Latencia de API Gateway
   - Errores 4xx/5xx

### Primeros 30 Minutos

- [ ] Login funciona correctamente
- [ ] Dashboard carga sin errores
- [ ] Formularios se envían correctamente
- [ ] APIs responden correctamente
- [ ] No hay errores en consola del navegador
- [ ] CloudWatch sin alertas críticas

## 🔥 Plan de Contingencia

### Si algo falla INMEDIATAMENTE

1. **Ejecutar rollback** (ver sección arriba)
2. **Notificar al equipo**
3. **Investigar en ambiente local/QA**
4. **Fix + Test en QA**
5. **Redesplegar a PROD**

### Si falla DESPUÉS de unos minutos

1. **Verificar logs de CloudWatch**
2. **Revisar métricas de API Gateway**
3. **Verificar conectividad con Cognito/DynamoDB**
4. **Si es crítico → Rollback**
5. **Si es menor → Fix rápido + Redeploy**

## 🎛️ Variables de Entorno

### Asegúrate de que el `.env` o configuración tenga:

```env
REACT_APP_STAGE=prod
REACT_APP_API_URL=<URL-DEL-API-GATEWAY-PROD>
REACT_APP_COGNITO_USER_POOL_ID=<USER-POOL-ID-PROD>
REACT_APP_COGNITO_CLIENT_ID=<CLIENT-ID-PROD>
REACT_APP_REGION=us-east-1
```

## 📞 Contactos de Emergencia

- **DevOps Lead**: [Agregar contacto]
- **Backend Lead**: [Agregar contacto]
- **Security Team**: [Agregar contacto]
- **AWS Support**: [Si tienen plan de soporte]

## 🚨 Errores Comunes

### "The security token included in the request is expired"
```bash
# Solución: Renovar credenciales MFA
aws-mfa --profile mentoria
```

### "Bucket already exists"
```bash
# Normal - el script lo maneja automáticamente
# Solo asegúrate de que el bucket sea el correcto
```

### "Access Denied"
```bash
# Verificar que tienes los permisos correctos
aws s3 ls --profile mentoria

# Si falla, verificar la política IAM en AWS Console
```

## ✅ Best Practices

1. **Siempre testear en QA primero**
2. **Deploy en horarios de bajo tráfico** (madrugada/fines de semana)
3. **Tener a alguien más disponible** durante el deploy
4. **Comunicar al equipo** antes de desplegar
5. **Tener plan de rollback listo**
6. **Monitorear los primeros 30 minutos** activamente
7. **Documentar cualquier issue** que surja

## 🔄 Proceso Recomendado

```
┌─────────────────┐
│  1. Test en QA  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Code Review  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. Merge a main │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. Deploy PROD  │
│    (Frontend)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. Verificar    │
│    Frontend     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. Deploy PROD  │
│    (Backend)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 7. Monitoreo    │
│    (30+ min)    │
└─────────────────┘
```

---

**Última actualización**: 2025-10-29  
**Autor**: DevOps Team

