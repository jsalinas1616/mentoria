import axios from 'axios';
import cognitoAuth from './cognitoAuth';

// URL base de la API - se puede configurar con variable de entorno
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://g6eh2ci3pf.execute-api.us-east-1.amazonaws.com/api';

console.log('API_BASE_URL:', API_BASE_URL);

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
      console.log('📡 Resultado de cognitoAuth.login:', result);
      
      // Si necesita cambiar contraseña, retornar información especial
      if (result.challengeName === 'NEW_PASSWORD_REQUIRED') {
        console.log('🔐 Detectado NEW_PASSWORD_REQUIRED - Retornando challenge');
        return {
          success: false,
          newPasswordRequired: true,
          cognitoUser: result.cognitoUser,
          userAttributes: result.userAttributes,
        };
      }
      
      // Login exitoso
      console.log('✅ Login exitoso en authService');
      return {
        success: true,
        user: result.user,
        token: result.tokens.idToken,
      };
    } catch (error) {
      console.error('❌ Error en authService.login:', error);
      throw error;
    }
  },
  
  completeNewPassword: async (cognitoUser, newPassword, userAttributes = {}) => {
    try {
      console.log('📝 Completando cambio de contraseña con atributos:', userAttributes);
      const result = await cognitoAuth.completeNewPassword(cognitoUser, newPassword, userAttributes);
      return {
        success: true,
        user: result.user,
        token: result.session.getIdToken().getJwtToken(),
      };
    } catch (error) {
      console.error('❌ Error al cambiar contraseña:', error);
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


