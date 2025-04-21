import axios from 'axios';

// Crear una instancia personalizada de axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir el token de autenticación a todas las solicitudes
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta (opcional)
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Manejar errores de autenticación (401)
    if (error.response && error.response.status === 401) {
      // Redirigir al login o mostrar mensaje
      localStorage.removeItem('authToken');
      // Si estás usando React Router:
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;