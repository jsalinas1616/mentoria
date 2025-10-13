# 📚 Documentación de API - Nadro Mentoría

Base URL (Desarrollo): `http://localhost:3001/api`
Base URL (Producción): `https://tu-api-gateway-url/api`

## 🔐 Autenticación

Todas las rutas (excepto login y registro) requieren un token JWT en el header:

```
Authorization: Bearer {token}
```

---

## 🔑 Endpoints de Autenticación

### POST /auth/login
Iniciar sesión

**Request:**
```json
{
  "email": "admin@nadro.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@nadro.com",
    "nombre": "Administrador",
    "rol": "admin"
  }
}
```

**Errores:**
- 400: Email y contraseña requeridos
- 401: Credenciales inválidas

---

### POST /auth/registrar
Registrar nuevo usuario

**Request:**
```json
{
  "email": "mentor@nadro.com",
  "nombre": "Juan Pérez",
  "password": "password123",
  "rol": "mentor"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "mentor@nadro.com",
  "nombre": "Juan Pérez",
  "rol": "mentor",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /auth/me
Obtener información del usuario actual (requiere autenticación)

**Response (200):**
```json
{
  "id": "uuid",
  "email": "admin@nadro.com",
  "nombre": "Administrador",
  "rol": "admin"
}
```

---

## 📝 Endpoints de Consultas

### POST /consultas
Crear nueva consulta (requiere autenticación)

**Request:**
```json
{
  "nombreMentor": "Juan Pérez García",
  "correoMentor": "juan.perez@nadro.com",
  "fecha": "2024-01-15",
  "lugarTrabajo": "CDR SUCURSAL MÉXICO SUR",
  "area": "Almacén Diurno",
  "lugarConsulta": "Lugar de trabajo",
  "motivosConsulta": ["Ansiedad", "Estrés"],
  "observaciones": "Consulta de seguimiento"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "nombreMentor": "Juan Pérez García",
  "correoMentor": "juan.perez@nadro.com",
  "fecha": "2024-01-15",
  "lugarTrabajo": "CDR SUCURSAL MÉXICO SUR",
  "area": "Almacén Diurno",
  "lugarConsulta": "Lugar de trabajo",
  "motivosConsulta": ["Ansiedad", "Estrés"],
  "observaciones": "Consulta de seguimiento",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### GET /consultas
Listar todas las consultas con filtros (requiere autenticación)

**Query Parameters:**
- `fechaInicio` (opcional): Filtrar desde fecha (YYYY-MM-DD)
- `fechaFin` (opcional): Filtrar hasta fecha (YYYY-MM-DD)
- `lugarTrabajo` (opcional): Filtrar por lugar de trabajo
- `area` (opcional): Filtrar por área

**Ejemplo:**
```
GET /consultas?fechaInicio=2024-01-01&lugarTrabajo=CORPORATIVO
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nombreMentor": "Juan Pérez García",
    "correoMentor": "juan.perez@nadro.com",
    "fecha": "2024-01-15",
    "lugarTrabajo": "CDR SUCURSAL MÉXICO SUR",
    "area": "Almacén Diurno",
    "lugarConsulta": "Lugar de trabajo",
    "motivosConsulta": ["Ansiedad", "Estrés"],
    "observaciones": "Consulta de seguimiento",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### GET /consultas/:id
Obtener una consulta específica (requiere autenticación)

**Response (200):**
```json
{
  "id": "uuid",
  "nombreMentor": "Juan Pérez García",
  "correoMentor": "juan.perez@nadro.com",
  "fecha": "2024-01-15",
  "lugarTrabajo": "CDR SUCURSAL MÉXICO SUR",
  "area": "Almacén Diurno",
  "lugarConsulta": "Lugar de trabajo",
  "motivosConsulta": ["Ansiedad", "Estrés"],
  "observaciones": "Consulta de seguimiento",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Errores:**
- 404: Consulta no encontrada

---

### PUT /consultas/:id
Actualizar consulta (requiere autenticación)

**Request:**
```json
{
  "observaciones": "Observaciones actualizadas",
  "motivosConsulta": ["Ansiedad", "Estrés", "Familia"]
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "nombreMentor": "Juan Pérez García",
  "correoMentor": "juan.perez@nadro.com",
  "fecha": "2024-01-15",
  "lugarTrabajo": "CDR SUCURSAL MÉXICO SUR",
  "area": "Almacén Diurno",
  "lugarConsulta": "Lugar de trabajo",
  "motivosConsulta": ["Ansiedad", "Estrés", "Familia"],
  "observaciones": "Observaciones actualizadas",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

### DELETE /consultas/:id
Eliminar consulta (requiere autenticación)

**Response (200):**
```json
{
  "message": "Consulta eliminada correctamente"
}
```

---

### GET /consultas/export
Exportar consultas (requiere autenticación)

**Query Parameters:**
Los mismos que `/consultas`

**Response (200):**
Array JSON con todas las consultas filtradas

---

## 📊 Endpoints de Dashboard

### GET /dashboard/stats
Obtener estadísticas del dashboard (requiere autenticación)

**Query Parameters:**
Los mismos que `/consultas` para filtrar

**Response (200):**
```json
{
  "totalConsultas": 150,
  "consultasMes": 25,
  "motivosMasFrecuentes": [
    { "motivo": "Ansiedad", "count": 45 },
    { "motivo": "Estrés", "count": 38 },
    { "motivo": "Familia", "count": 25 }
  ],
  "lugaresTrabajo": [
    { "lugar": "CDR SUCURSAL MÉXICO SUR", "count": 30 },
    { "lugar": "CORPORATIVO", "count": 25 }
  ],
  "consultasPorFecha": [
    { "fecha": "2024-01-15", "count": 5 },
    { "fecha": "2024-01-16", "count": 8 }
  ]
}
```

---

## 🏥 Health Check

### GET /health
Verificar estado del API (no requiere autenticación)

**Response (200):**
```json
{
  "status": "OK",
  "message": "Nadro Mentoría API funcionando correctamente"
}
```

---

## 🏠 Root

### GET /
Información de la API (no requiere autenticación)

**Response (200):**
```json
{
  "message": "Bienvenido a Nadro Mentoría API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "consultas": "/api/consultas",
    "dashboard": "/api/dashboard"
  }
}
```

---

## ⚠️ Códigos de Error

- **400**: Bad Request - Datos inválidos o faltantes
- **401**: Unauthorized - Token de autenticación faltante o inválido
- **403**: Forbidden - Token expirado
- **404**: Not Found - Recurso no encontrado
- **500**: Internal Server Error - Error del servidor

**Formato de error:**
```json
{
  "error": true,
  "message": "Descripción del error"
}
```

---

## 🔧 Ejemplos de Uso

### cURL

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nadro.com","password":"admin123"}'
```

**Crear consulta:**
```bash
curl -X POST http://localhost:3001/api/consultas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "nombreMentor": "Juan Pérez",
    "correoMentor": "juan@nadro.com",
    "fecha": "2024-01-15",
    "lugarTrabajo": "CORPORATIVO",
    "area": "Sistemas",
    "lugarConsulta": "Videollamada",
    "motivosConsulta": ["Ansiedad"],
    "observaciones": "Primera consulta"
  }'
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Login
const login = async () => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email: 'admin@nadro.com',
    password: 'admin123'
  });
  return response.data.token;
};

// Crear consulta
const crearConsulta = async (token, consulta) => {
  const response = await axios.post(`${API_URL}/consultas`, consulta, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// Obtener estadísticas
const obtenerStats = async (token) => {
  const response = await axios.get(`${API_URL}/dashboard/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};
```

---

**Última actualización:** Enero 2024


