# Changelog - Nadro Mentoría

Todos los cambios notables en este proyecto serán documentados en este archivo.

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

### v1.1.0 (Planeado)
- [ ] Exportación a Excel real (XLSX)
- [ ] Exportación a PDF
- [ ] Notificaciones por email
- [ ] Búsqueda avanzada de consultas
- [ ] Filtros guardados
- [ ] Modo oscuro/claro toggle
- [ ] Soporte multi-idioma

### v1.2.0 (Planeado)
- [ ] Reportes personalizados
- [ ] Calendario de consultas
- [ ] Recordatorios automáticos
- [ ] Chat en tiempo real
- [ ] Videoconferencia integrada
- [ ] Almacenamiento de documentos

### v2.0.0 (Futuro)
- [ ] App móvil nativa (React Native)
- [ ] Inteligencia artificial para análisis
- [ ] Predicciones de tendencias
- [ ] Sistema de roles avanzado
- [ ] Auditoría completa
- [ ] API pública

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


