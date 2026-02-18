import axios from 'axios';
import { API_URL } from '../utils/constants';
import { obtenerToken, limpiarSesion } from '../utils/storage';

// Instancia base de axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Callback para cerrar sesión forzado - se registra desde AuthContext
let cerrarSesionCallback = null;

export const registrarCerrarSesion = (callback) => {
  cerrarSesionCallback = callback;
};

// Interceptor de solicitud - agrega el token JWT a cada petición
api.interceptors.request.use(
  async (config) => {
    const token = await obtenerToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta - maneja errores globales
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si el servidor responde 401, la sesión fue cerrada en otro dispositivo
    if (error.response?.status === 401) {
      await limpiarSesion();
      if (cerrarSesionCallback) {
        cerrarSesionCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
