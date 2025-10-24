# Variables de Entorno - Frontend

## 📁 Archivos de configuración

```
frontend/
├── .env.development      → Para desarrollo local (npm start)
├── .env.production       → Para build de producción (npm build)
└── .env.local (opcional) → Para overrides locales (NO se sube a Git)
```

## 🚀 Para desarrollo local

**Ya está todo configurado.** Solo ejecuta:

```bash
cd frontend
npm start
```

El archivo `.env.development` ya tiene los valores correctos del deployment.

## 🔧 Si necesitas cambiar valores

### Opción 1: Editar directamente
```bash
nano frontend/.env.development
```

### Opción 2: Crear override local (recomendado)
```bash
# Crea .env.local con tus valores personales
cat > frontend/.env.local << 'EOF'
REACT_APP_API_URL=https://TU-API.execute-api.us-east-1.amazonaws.com/api
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXX
REACT_APP_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxx
REACT_APP_AWS_REGION=us-east-1
EOF
```

> `.env.local` NO se sube a Git y tiene prioridad sobre `.env.development`

## 📝 Variables disponibles

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `REACT_APP_API_URL` | URL del API Gateway | `https://xxxxx.execute-api.us-east-1.amazonaws.com/api` |
| `REACT_APP_COGNITO_USER_POOL_ID` | ID del User Pool de Cognito | `us-east-1_xxxxxxx` |
| `REACT_APP_COGNITO_CLIENT_ID` | ID del Client de Cognito | `xxxxxxxxxxxxxxxxx` |
| `REACT_APP_AWS_REGION` | Región de AWS | `us-east-1` |

## 🔍 Verificar configuración

Abre el navegador en `http://localhost:3000` y revisa la consola:
```
API_BASE_URL: https://pmgxt2ff5c.execute-api.us-east-1.amazonaws.com/api
```

## ⚠️ Importante

- ✅ Las variables DEBEN empezar con `REACT_APP_`
- ✅ Reinicia el servidor después de cambiar variables
- ✅ `.env.local` no se sube a Git (para valores personales)
- ✅ `.env.development` y `.env.production` SÍ se suben a Git

---

**¡Eso es todo!** Ya puedes hacer `npm start` y funciona. 🎉

