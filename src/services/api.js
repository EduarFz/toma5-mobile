import axios from 'axios';
import { API_URL } from '../utils/constants';
import { obtenerToken } from '../utils/storage';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let cerrarSesionCallback = null;

export const registrarCerrarSesion = (callback) => {
  cerrarSesionCallback = callback;
};

// Interceptor de solicitud
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

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Siempre llamar el callback (limpia estado React + AsyncStorage)
      // La diferencia DEV/PROD está en AuthContext, no aquí
      if (cerrarSesionCallback) {
        cerrarSesionCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
