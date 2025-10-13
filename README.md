# 🏥 Nadro Mentoría - Sistema de Consulta Integral

Sistema completo para gestionar reportes de consultas de mentoría integral en Nadro.

## 🎨 Características

### Frontend
- ✅ React 18 con Tailwind CSS
- ✅ Diseño moderno con paleta de colores corporativa
- ✅ Sistema de autenticación seguro
- ✅ Formulario completo de consulta con validaciones
- ✅ Dashboard interactivo con estadísticas y gráficos
- ✅ Visualizaciones con Recharts
- ✅ Responsive y optimizado para móviles

### Backend
- ✅ Express.js con arquitectura serverless
- ✅ API REST completa
- ✅ Autenticación JWT
- ✅ Integración con AWS DynamoDB
- ✅ Logging automático a archivo
- ✅ Manejo de errores centralizado
- ✅ Listo para desplegar en AWS Lambda

### Características del Sistema
- 📝 Registro completo de consultas con:
  - Datos del mentor (nombre, correo)
  - Información laboral (lugar de trabajo, área)
  - Detalles de consulta (lugar, motivos múltiples)
  - Observaciones adicionales
- 📊 Dashboard con:
  - KPIs principales
  - Gráficos de barras, pastel y líneas
  - Filtros avanzados
  - Exportación de datos
  - Tabla de consultas recientes
- 🔐 Sistema de autenticación robusto
- 📱 Interfaz responsive

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- NPM o Yarn
- AWS CLI configurado
- Cuenta de AWS con permisos para DynamoDB y Lambda

### 1. Clonar e instalar dependencias

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# Infrastructure
cd ../infrastructure
npm install
```

### 2. Configurar AWS

```bash
# Configurar credenciales de AWS
aws configure

# Ejecutar script de configuración
./infrastructure/setup.sh
```

Esto creará:
- Tablas de DynamoDB
- Usuario inicial (admin@nadro.com / admin123)

### 3. Configurar variables de entorno

**Backend** (crear archivo `backend/.env`):
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=nadro-mentoria-secret-key-2024
JWT_EXPIRES_IN=7d
AWS_REGION=us-east-1
CONSULTAS_TABLE=NadroMentoria-Consultas
USUARIOS_TABLE=NadroMentoria-Usuarios
```

**Frontend** (crear archivo `frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 4. Ejecutar en desarrollo

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

El sistema estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### 5. Credenciales iniciales

```
Email: admin@nadro.com
Password: admin123
```

⚠️ **IMPORTANTE:** Cambia estas credenciales después del primer login.

## 📁 Estructura del Proyecto

```
Mentorias/
├── frontend/                # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   ├── Auth/       # Login
│   │   │   ├── Dashboard/  # Dashboard con gráficos
│   │   │   └── FormularioConsulta/
│   │   ├── data/           # Catálogos (JSON)
│   │   ├── services/       # Servicios API
│   │   └── utils/          # Utilidades
│   └── package.json
│
├── backend/                # API Express
│   ├── src/
│   │   ├── config/         # Configuración
│   │   ├── controllers/    # Controladores
│   │   ├── middleware/     # Middlewares
│   │   ├── routes/         # Rutas
│   │   ├── services/       # Lógica de negocio
│   │   └── index.js        # Punto de entrada
│   ├── serverless.yml      # Configuración Serverless
│   └── package.json
│
├── infrastructure/         # Scripts de infraestructura
│   ├── create-dynamodb-tables.js
│   ├── create-initial-user.js
│   └── setup.sh
│
└── README.md
```

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/registrar` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual (requiere auth)

### Consultas
- `POST /api/consultas` - Crear consulta
- `GET /api/consultas` - Listar consultas (con filtros)
- `GET /api/consultas/:id` - Obtener consulta
- `PUT /api/consultas/:id` - Actualizar consulta
- `DELETE /api/consultas/:id` - Eliminar consulta
- `GET /api/consultas/export` - Exportar consultas

### Dashboard
- `GET /api/dashboard/stats` - Obtener estadísticas

### Health Check
- `GET /api/health` - Verificar estado del API

## 🎨 Paleta de Colores

```css
Verde Principal: #6B8E23, #7A9B3C
Verde Botones: #8FB339
Fondo Oscuro (Cards): #2C2C2C
Inputs Oscuros: #3A3A3A
Texto Principal: #FFFFFF
Texto Secundario: #B0B0B0
```

## 📦 Deployment a AWS

### Backend (Lambda + API Gateway + DynamoDB)

```bash
cd backend
npm run deploy
```

Esto desplegará:
- Lambda function con Express
- API Gateway
- Tablas DynamoDB
- Permisos IAM necesarios

### Frontend (S3 + CloudFront)

```bash
cd frontend
npm run build

# Subir a S3
aws s3 sync build/ s3://tu-bucket-nombre --delete

# Invalidar caché de CloudFront (opcional)
aws cloudfront create-invalidation --distribution-id TU_DIST_ID --paths "/*"
```

## 🔧 Scripts Disponibles

### Frontend
- `npm start` - Desarrollo
- `npm run build` - Build de producción
- `npm test` - Ejecutar tests

### Backend
- `npm run dev` - Desarrollo con nodemon
- `npm start` - Producción
- `npm run deploy` - Desplegar a AWS Lambda
- `npm run remove` - Eliminar deployment de AWS

### Infrastructure
- `./setup.sh` - Configuración inicial completa

## 📊 Catálogos de Datos

El sistema incluye catálogos precargados:
- **Lugares de Trabajo**: 17 CDRs, Farmatodo, Ubictum, Corporativo
- **Áreas**: 285 áreas diferentes
- **Motivos de Consulta**: 37 motivos diferentes
- **Lugares de Consulta**: 7 opciones

## 🔐 Seguridad

- Autenticación JWT con tokens de 7 días
- Contraseñas encriptadas con bcrypt
- CORS configurado
- Middleware de autenticación en rutas protegidas
- Validación de datos en frontend y backend
- Logs automáticos de todas las peticiones

## 📝 Logs

Todos los console.log se registran automáticamente en:
- Backend: `backend/logs.txt`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial de Nadro.

## 👥 Soporte

Para soporte técnico o preguntas, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para Nadro**


