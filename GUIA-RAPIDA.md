# 🚀 Guía Rápida - Nadro Mentoría

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Instalar dependencias

```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install

# Infrastructure
cd ../infrastructure && npm install
```

### 2️⃣ Configurar AWS (si aún no lo has hecho)

```bash
aws configure
# Ingresa tus credenciales:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Output format: json
```

### 3️⃣ Crear tablas e usuario inicial

```bash
cd infrastructure
npm run setup
```

### 4️⃣ Ejecutar el sistema

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 5️⃣ Abrir en el navegador

```
http://localhost:3000
```

**Credenciales:**
- Email: `admin@nadro.com`
- Password: `admin123`

---

## 📝 Flujo de Trabajo

### Crear una nueva consulta:

1. Haz login con las credenciales
2. Click en "Nueva Consulta"
3. Completa el formulario:
   - ✅ Nombre completo
   - ✅ Correo electrónico
   - ✅ Fecha
   - ✅ Lugar de trabajo
   - ✅ Área (usa el buscador)
   - ✅ Lugar de consulta
   - ✅ Motivos (puedes seleccionar varios)
   - ✅ Observaciones (opcional)
4. Click en "GUARDAR CONSULTA"

### Ver estadísticas:

El dashboard muestra automáticamente:
- 📊 Total de consultas
- 📅 Consultas del mes
- 🔝 Motivos más frecuentes
- 🏢 Distribución por lugares
- 📈 Tendencias
- 📋 Tabla de consultas recientes

### Filtrar consultas:

1. Click en "Mostrar Filtros"
2. Aplica filtros por:
   - Rango de fechas
   - Lugar de trabajo
   - Área
3. Los gráficos y tabla se actualizan automáticamente

### Exportar datos:

Click en "Exportar Excel" en el dashboard

---

## 🔧 Comandos Útiles

### Frontend
```bash
npm start          # Desarrollo
npm run build      # Build de producción
```

### Backend
```bash
npm run dev        # Desarrollo con auto-reload
npm start          # Producción
npm run deploy     # Desplegar a AWS Lambda
```

### Infrastructure
```bash
npm run setup           # Configuración completa
npm run create-tables   # Solo crear tablas
npm run create-user     # Solo crear usuario
```

---

## 🐛 Solución de Problemas

### El backend no inicia
```bash
# Verificar que el puerto 3001 esté libre
lsof -ti:3001 | xargs kill -9

# Reinstalar dependencias
cd backend
rm -rf node_modules package-lock.json
npm install
```

### El frontend no se conecta al backend
1. Verifica que el backend esté corriendo en puerto 3001
2. Verifica el archivo `frontend/.env`:
   ```
   REACT_APP_API_URL=http://localhost:3001/api
   ```

### Error de AWS/DynamoDB
```bash
# Verificar credenciales
aws sts get-caller-identity

# Recrear tablas
cd infrastructure
npm run create-tables
```

### Error de autenticación
```bash
# Recrear usuario inicial
cd infrastructure
npm run create-user
```

---

## 📦 Deploy a Producción

### Backend a AWS Lambda:
```bash
cd backend
npm run deploy
# Anota la URL del API Gateway
```

### Frontend a S3:
```bash
cd frontend

# Actualizar .env con la URL del API
# REACT_APP_API_URL=https://tu-api-gateway-url/dev/api

npm run build

# Subir a S3
aws s3 sync build/ s3://tu-bucket --delete
```

---

## 💡 Tips

- 🔄 El sistema guarda automáticamente en DynamoDB
- 📝 Todos los logs se guardan en `backend/logs.txt`
- 🎨 La interfaz es responsive (móvil, tablet, desktop)
- 🔐 Los tokens expiran en 7 días
- 📊 Los gráficos son interactivos (hover para detalles)

---

## 🆘 Ayuda

Si tienes problemas:
1. Revisa `backend/logs.txt` para errores del servidor
2. Abre la consola del navegador (F12) para errores del frontend
3. Verifica que AWS esté configurado correctamente
4. Asegúrate de tener Node.js 18 o superior

---

**¡Listo! El sistema está funcionando. 🎉**


