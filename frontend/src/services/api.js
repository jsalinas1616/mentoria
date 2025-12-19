import axios from 'axios';
import cognitoAuth from './cognitoAuth';

// URL base de la API - se puede configurar con variable de entorno
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ecdumohel3.execute-api.us-east-1.amazonaws.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación de Cognito
api.interceptors.request.use((config) => {
  const token = cognitoAuth.getToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar respuestas y tokens expirados
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo manejar 401 si NO estamos en login
    const isOnLoginPage = window.location.hash.includes('/admin/login');
    
    if (error.response?.status === 401 && !isOnLoginPage) {
      // Limpiar datos de autenticación
      cognitoAuth.logout();
      
      // Redirigir al login
      window.location.href = '#/admin/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación usando Cognito
export const authService = {
  login: async (email, password) => {
    try {
      const result = await cognitoAuth.login(email, password);
      
      // Si necesita cambiar contraseña, retornar información especial
      if (result.challengeName === 'NEW_PASSWORD_REQUIRED') {
        return {
          success: false,
          newPasswordRequired: true,
          cognitoUser: result.cognitoUser,
          userAttributes: result.userAttributes,
        };
      }
      
      // Login exitoso
      return {
        success: true,
        user: result.user,
        token: result.tokens.idToken,
      };
    } catch (error) {
      throw error;
    }
  },
  
  completeNewPassword: async (cognitoUser, newPassword, userAttributes = {}) => {
    try {
      const result = await cognitoAuth.completeNewPassword(cognitoUser, newPassword, userAttributes);
      return {
        success: true,
        user: result.user,
        token: result.session.getIdToken().getJwtToken(),
      };
    } catch (error) {
      throw error;
    }
  },
  
  logout: () => {
    cognitoAuth.logout();
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isTokenValid: () => {
    return cognitoAuth.isAuthenticated();
  },
  
  forgotPassword: async (email) => {
    return await cognitoAuth.forgotPassword(email);
  },
  
  confirmPassword: async (email, code, newPassword) => {
    return await cognitoAuth.confirmPassword(email, code, newPassword);
  },
};

// Servicios de consultas
export const consultasService = {
  // Crear consulta pública (sin autenticación)
  crear: async (consulta) => {
    const response = await api.post('/consultas', consulta);
    return response.data;
  },
  
  // Consultas protegidas (requieren autenticación) - ahora en dashboard
  listar: async (filtros = {}) => {
    const response = await api.get('/dashboard/consultas', { params: filtros });
    return response.data;
  },
  
  obtener: async (id) => {
    const response = await api.get(`/dashboard/consultas/${id}`);
    return response.data;
  },
  
  actualizar: async (id, consulta) => {
    const response = await api.put(`/dashboard/consultas/${id}`, consulta);
    return response.data;
  },
  
  eliminar: async (id) => {
    const response = await api.delete(`/dashboard/consultas/${id}`);
    return response.data;
  },
};

// Servicios de capacitaciones
export const capacitacionesService = {
  crear: async (capacitacion) => {
    const response = await api.post('/capacitaciones', capacitacion);
    return response.data.data || response.data;
  },
  
  listar: async (filtros = {}) => {
    const response = await api.get('/capacitaciones', { params: filtros });
    return response.data.data || response.data; // Extraer el array de "data"
  },
  
  obtener: async (id) => {
    const response = await api.get(`/capacitaciones/${id}`);
    return response.data.data || response.data;
  },
  
  actualizar: async (id, capacitacion) => {
    const response = await api.put(`/capacitaciones/${id}`, capacitacion);
    return response.data.data || response.data;
  },
  
  eliminar: async (id) => {
    const response = await api.delete(`/capacitaciones/${id}`);
    return response.data;
  },

  exportar: async (formato = 'excel', filtros = {}) => {
    const response = await api.get('/capacitaciones/export', {
      params: { formato, ...filtros },
      responseType: 'blob',
    });
    return response.data;
  },
};

// Servicios de entrevistas
export const entrevistasService = {
  // Crear entrevista pública (sin autenticación)
  crear: async (entrevista) => {
    const response = await api.post('/entrevistas', entrevista);
    return response.data;
  },
  
  // Consultas protegidas (requieren autenticación) - ahora en dashboard
  listar: async (filtros = {}) => {
    const response = await api.get('/entrevistas', { params: filtros });
    return response.data;
  },
  
  obtener: async (id) => {
    const response = await api.get(`/entrevistas/${id}`);
    return response.data;
  },
  
  actualizar: async (id, entrevista) => {
    const response = await api.put(`/entrevistas/${id}`, entrevista);
    return response.data;
  },
  
  eliminar: async (id) => {
    const response = await api.delete(`/entrevistas/${id}`);
    return response.data;
  },
};

//servicios de Acercamientos
export const acercamientosService = {
  // Crear consulta pública (sin autenticación)
  crear: async (acercamiento) => {
    const response = await api.post('/acercamientos', acercamiento);
    return response.data;
  },
  
  // acercamientos protegidas (requieren autenticación) - ahora en dashboard
  listar: async (filtros = {}) => {
    const response = await api.get('/dashboard/acercamientos', { params: filtros });
    return response.data;
  },
  
  obtener: async (id) => {
    const response = await api.get(`/dashboard/acercamientos/${id}`);
    return response.data;
  },
  
  actualizar: async (id, acercamiento) => {
    const response = await api.put(`/dashboard/acercamientos/${id}`, acercamiento);
    return response.data;
  },
  
  eliminar: async (id) => {
    const response = await api.delete(`/dashboard/acercamientos/${id}`);
    return response.data;
  },
};

// Servicios de dashboard
export const dashboardService = {
  obtenerEstadisticas: async (filtros = {}) => {
    const response = await api.get('/dashboard/stats', { params: filtros });
    return response.data;
  },
  
  exportar: async (formato = 'excel', filtros = {}) => {
    const response = await api.get('/dashboard/consultas/export', {
      params: { formato, ...filtros },
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;


