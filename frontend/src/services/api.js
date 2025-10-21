import axios from 'axios';

// URL base de la API - se configurará según el ambiente
const API_BASE_URL = 'https://g6eh2ci3pf.execute-api.us-east-1.amazonaws.com/api';

console.log('API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  
  // No enviar token para rutas públicas (solo POST /consultas)
  const isPublicConsulta = config.url?.includes('/consultas') && config.method === 'post';
  
  if (token && !isPublicConsulta) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar respuestas y tokens expirados
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo manejar 401 si NO estamos en login y NO es una petición de login
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    const isOnLoginPage = window.location.hash.includes('/admin/login');
    
    if (error.response?.status === 401 && !isLoginRequest && !isOnLoginPage) {
      // Limpiar datos de autenticación
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Redirigir al login
      window.location.href = '#/admin/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isTokenValid: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      // Decodificar el token JWT (solo la parte del payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Verificar si el token no ha expirado
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
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


