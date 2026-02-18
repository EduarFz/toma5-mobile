import api from './api';

// Login - cédula + contraseña
const login = async (cedula, contrasena) => {
  const respuesta = await api.post('/auth/login', { cedula, contrasena });
  return respuesta.data;
};

// Logout - invalida el token en el backend
const logout = async () => {
  const respuesta = await api.post('/auth/logout');
  return respuesta.data;
};

// Obtener perfil del usuario autenticado
const obtenerPerfil = async () => {
  const respuesta = await api.get('/auth/perfil');
  return respuesta.data;
};

// Cambiar contraseña
const cambiarContrasena = async (contrasenaActual, contrasenaNueva) => {
  const respuesta = await api.post('/auth/cambiar-contrasena', {
    contrasenaActual,
    contrasenaNueva,
  });
  return respuesta.data;
};

export default { login, logout, obtenerPerfil, cambiarContrasena };
