import axios from 'axios';

// URL base de la API - se configurará según el ambiente
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
};

// Servicios de consultas
export const consultasService = {
  crear: async (consulta) => {
    const response = await api.post('/consultas', consulta);
    return response.data;
  },
  
  listar: async (filtros = {}) => {
    const response = await api.get('/consultas', { params: filtros });
    return response.data;
  },
  
  obtener: async (id) => {
    const response = await api.get(`/consultas/${id}`);
    return response.data;
  },
  
  actualizar: async (id, consulta) => {
    const response = await api.put(`/consultas/${id}`, consulta);
    return response.data;
  },
  
  eliminar: async (id) => {
    const response = await api.delete(`/consultas/${id}`);
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
    const response = await api.get('/consultas/export', {
      params: { formato, ...filtros },
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;


