# Changelog - Nadro Mentoría

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [2.0.0] - 2024-10-23

### 🚀 Cambios Importantes (Breaking Changes)

#### Migración a AWS Cognito
- ✅ **Reemplazo completo de autenticación JWT manual por AWS Cognito**
- ✅ Sistema de roles integrado (admin, mentor)
- ✅ Gestión de usuarios centralizada en Cognito
- ✅ Eliminación de tabla de usuarios de DynamoDB (ahora en Cognito)
- ✅ Autenticación federada lista para Microsoft/Azure AD

#### Cambios de Backend
- ✅ Nuevo servicio `cognitoService.js` para gestión de usuarios
- ✅ Middleware de autenticación actualizado para JWT de Cognito
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Eliminación de `authService.js` legacy
- ✅ Eliminación de variables de entorno `JWT_SECRET` y `JWT_EXPIRES_IN`
- ✅ Nuevas variables: `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`

#### Cambios de Infraestructura
- ✅ Cognito User Pool configurado en `serverless.yml`
- ✅ HTTP API Authorizer para validación automática de JWT
- ✅ Grupos de Cognito: `admin` y `mentor`
- ✅ Permisos IAM actualizados para Cognito

#### Rutas de API Actualizadas
- ✅ Eliminadas rutas: `/api/auth/registrar`, `/api/auth/login`
- ✅ Nuevas rutas protegidas:
  - `GET /api/auth/usuarios` - Listar usuarios (admin)
  - `POST /api/auth/usuarios` - Crear usuario (admin)
  - `PUT /api/auth/usuarios/:email/rol` - Cambiar rol (admin)
  - `PUT /api/auth/usuarios/:email/password` - Cambiar contraseña (admin)
  - `POST /api/auth/usuarios/:email/disable` - Deshabilitar usuario (admin)
  - `POST /api/auth/usuarios/:email/enable` - Habilitar usuario (admin)

#### Control de Acceso por Roles
- ✅ **Admins:** Acceso completo (stats, CRUD consultas, gestión usuarios)
- ✅ **Mentors:** Acceso a consultas (crear, listar, actualizar), sin delete ni stats
- ✅ Dashboard stats: Solo admins
- ✅ Eliminar consultas: Solo admins

#### Seguridad Mejorada
- ✅ **Acceso público removido:** Todo el sistema requiere autenticación ahora
- ✅ **Login obligatorio:** No hay rutas públicas (depreciado de v1.1.0)
- ✅ **Todas las consultas protegidas:** Solo usuarios autenticados pueden crear/ver consultas

### 📝 Documentación Consolidada

#### Nueva Documentación
- ✅ **GUIA-DEPLOYMENT-COMPLETA.md** - Guía unificada de deployment
- ✅ **INDICE-DOCUMENTACION.md** - Índice rápido de toda la documentación
- ✅ **COGNITO-IMPLEMENTACION.md** - Guía técnica de Cognito
- ✅ **PERMISOS-AWS-SIMPLE.md** - Actualizado con permisos de Cognito

#### Documentación Eliminada (consolidada)
- ❌ DEPLOYMENT-GUIDE.md (legacy)
- ❌ DEPLOYMENT-COMPLETO.md (legacy)
- ❌ DEPLOYMENT-COGNITO.md (borrador, reemplazado)
- ❌ GUIA-RAPIDA.md (legacy)
- ❌ INICIO.md (legacy)
- ❌ INTEGRACION-CONSULTAS-DASHBOARD.md (completado)
- ❌ GUIA-DEPLOYMENT-RAPIDA.md (reemplazado)

### 🔒 Mejoras de Seguridad
- ✅ Autenticación manejada por AWS (más segura)
- ✅ Tokens JWT firmados por Cognito
- ✅ Rotación automática de claves
- ✅ Políticas de contraseñas configurables
- ✅ MFA listo para habilitar
- ✅ Protección contra ataques de fuerza bruta

### 🔧 Cambios Técnicos

#### Scripts de Infraestructura
- ✅ `migrate-users-to-cognito.js` - Script de migración (si necesario)
- ✅ Usuario inicial ahora se crea en Cognito (no DynamoDB)

#### Frontend (preparado para Cognito)
- Variables de entorno actualizadas:
  - `REACT_APP_COGNITO_USER_POOL_ID`
  - `REACT_APP_COGNITO_CLIENT_ID`
  - `REACT_APP_AWS_REGION`

---

## [1.1.0] - 2024-10-13

### 🎉 Características Nuevas

#### Acceso Público al Formulario
- ✅ **Formulario público sin login** - Los usuarios pueden acceder directamente sin autenticación
- ✅ Sistema de rutas mejorado con React Router
  - Ruta pública `/` para el formulario de mentoría
  - Rutas administrativas protegidas bajo `/admin/*`
- ✅ Endpoint público `POST /api/consultas` para registrar consultas
- ✅ Endpoints protegidos para gestión administrativa (GET, PUT, DELETE)

#### Arquitectura del Proyecto
- ✅ **Monorepo unificado** - Frontend, backend e infrastructure en un solo repositorio
- ✅ Eliminación de submódulos Git complejos
- ✅ Gestión simplificada de versiones

### 📝 Documentación
- ✅ Nuevo documento `ACCESO-PUBLICO.md` con guía completa de acceso
- ✅ Actualización de `README.md` con información de acceso público
- ✅ Actualización de `GUIA-RAPIDA.md` con URLs diferenciadas

### 🔒 Seguridad
- ✅ Separación clara entre rutas públicas y protegidas
- ✅ Autenticación JWT solo para funciones administrativas
- ✅ Validación de permisos por ruta

### 🎯 Mejoras de UX
- ✅ Acceso instantáneo al formulario (sin barreras)
- ✅ Experiencia simplificada para mentores
- ✅ Panel administrativo protegido y completo

### 🔧 Cambios Técnicos

#### Frontend
- Modificado `App.jsx` con sistema de rutas público/privado
- Actualizado `FormularioConsulta.jsx` para soportar modo público
- Eliminado botón "Salir" en modo público

#### Backend
- Modificado `consultasRoutes.js` para permitir POST público
- Mantenimiento de protección en rutas administrativas

---

## [1.0.0] - 2024-10-10

### ✨ Características Iniciales

#### Frontend
- ✅ Sistema de autenticación con JWT
- ✅ Formulario completo de registro de consultas
- ✅ Dashboard interactivo con estadísticas
- ✅ Gráficos de visualización (barras, pastel, líneas)
- ✅ Filtros avanzados de consultas
- ✅ Tabla de consultas recientes
- ✅ Diseño responsive para móviles y tablets
- ✅ Paleta de colores corporativa Nadro
- ✅ Validaciones de formularios en tiempo real
- ✅ Feedback visual de acciones

#### Backend
- ✅ API REST completa con Express.js
- ✅ Autenticación JWT con bcrypt
- ✅ Integración con AWS DynamoDB
- ✅ CRUD completo de consultas
- ✅ Endpoints de estadísticas y dashboard
- ✅ Logging automático a archivo
- ✅ Manejo centralizado de errores
- ✅ Middleware de autenticación
- ✅ Configuración para AWS Lambda

#### Infraestructura
- ✅ Scripts de setup automático
- ✅ Configuración Serverless Framework
- ✅ Creación automática de tablas DynamoDB
- ✅ Script de usuario inicial
- ✅ Configuración de deployment a AWS

#### Documentación
- ✅ README completo
- ✅ Guía rápida de inicio
- ✅ Documentación de API
- ✅ Scripts de inicio rápido
- ✅ Solución de problemas

### 📊 Catálogos Incluidos
- 17 Lugares de trabajo (CDRs, Farmatodo, Ubictum, Corporativo)
- 285 Áreas diferentes
- 37 Motivos de consulta
- 7 Lugares de consulta

### 🎨 Diseño
- Paleta de colores: Verde Nadro (#6B8E23, #8FB339)
- Tema oscuro para cards y formularios
- Tipografía: Inter
- Iconos: Lucide React

### 🔧 Tecnologías
**Frontend:**
- React 18
- Tailwind CSS
- React Hook Form
- Recharts
- Axios
- Framer Motion
- Lucide React

**Backend:**
- Node.js
- Express.js
- AWS SDK (DynamoDB)
- JWT
- Bcrypt
- Serverless Framework

### 📦 Deployment
- Frontend: Preparado para S3 + CloudFront
- Backend: Configurado para Lambda + API Gateway
- Base de datos: DynamoDB

---

## Próximas Características (Roadmap)

### v2.1.0 (Planeado)
- [ ] Frontend integrado con Cognito (Amplify UI)
- [ ] Autenticación federada con Microsoft/Azure AD
- [ ] MFA (autenticación de múltiples factores)
- [ ] Exportación a Excel real (XLSX)
- [ ] Exportación a PDF
- [ ] Notificaciones por email

### v2.2.0 (Planeado)
- [ ] Búsqueda avanzada de consultas
- [ ] Filtros guardados
- [ ] Reportes personalizados
- [ ] Calendario de consultas
- [ ] Recordatorios automáticos
- [ ] Modo oscuro/claro toggle

### v3.0.0 (Futuro)
- [ ] App móvil nativa (React Native)
- [ ] Inteligencia artificial para análisis
- [ ] Predicciones de tendencias
- [ ] Chat en tiempo real
- [ ] Videoconferencia integrada
- [ ] Almacenamiento de documentos S3
- [ ] Auditoría completa
- [ ] API pública documentada

---

## Mantenimiento

### Issues Conocidos
Ninguno reportado hasta el momento.

### Mejoras de Performance
- Paginación en lista de consultas (planeado para v1.1)
- Cache de estadísticas (planeado para v1.1)
- Optimización de queries DynamoDB (planeado para v1.2)

---

**Formato basado en [Keep a Changelog](https://keepachangelog.com/)**


