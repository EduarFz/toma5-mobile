import React, { createContext, useState, useEffect, useContext } from 'react';
import { ROLES } from '../utils/constants';
import { guardarToken, guardarUsuario, obtenerToken, obtenerUsuario, limpiarSesion } from '../utils/storage';
import authService from '../services/auth.service';
import { registrarCerrarSesion } from '../services/api';
import { registrarTokenPush } from '../services/notificaciones.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [sesionCerradaForzado, setSesionCerradaForzado] = useState(false);

// useEffect 1: solo cargar sesión al montar
useEffect(() => {
  cargarSesionGuardada();
}, []);

// useEffect 2: registrar el callback para cerrar sesión forzado
useEffect(() => {
  if (__DEV__) {
    registrarCerrarSesion(async () => {
      await limpiarSesion();
      setUsuario(null);
    });
  } else {
    registrarCerrarSesion(cerrarSesionForzado);
  }
}, []);

const cargarSesionGuardada = async () => {
  try {
    const token = await obtenerToken();
    const usuarioGuardado = await obtenerUsuario();

    if (token && usuarioGuardado) {
      setUsuario(usuarioGuardado);
    }
  } catch (error) {
    // Si falla (token inválido), limpiar silenciosamente
    console.log('[Auth] Sesión guardada inválida, limpiando...');
    await limpiarSesion();
  } finally {
    setCargando(false);
  }
};



 const login = async (cedula, contrasena) => {
  const datos = await authService.login(cedula, contrasena);

  if (datos.usuario.rol !== ROLES.TRABAJADOR) {
    throw new Error('Esta app es solo para trabajadores. Los supervisores deben usar la aplicación web.');
  }

  // ✅ Guardar token PRIMERO antes de cualquier otra llamada a la API
  await guardarToken(datos.token);

  const perfilRespuesta = await authService.obtenerPerfil();
  const usuarioConPerfil = {
    ...datos.usuario,
    trabajadorId: perfilRespuesta.usuario.trabajadorId || null,
  };

  await guardarUsuario(usuarioConPerfil);
  setUsuario(usuarioConPerfil);
  try {
  await registrarTokenPush();
} catch (e) {
  console.log('No se pudo registrar push token:', e);
}
  setSesionCerradaForzado(false);
  return datos;
};


  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Si falla el logout en el backend, igual limpiamos localmente
      console.error('Error al cerrar sesión en el backend:', error);
    } finally {
      await limpiarSesion();
      setUsuario(null);
    }
  };

  // Llamado desde el interceptor de axios cuando el servidor responde 401
  const cerrarSesionForzado = async () => {
    await limpiarSesion();
    setUsuario(null);
    setSesionCerradaForzado(true);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        sesionCerradaForzado,
        login,
        logout,
        cerrarSesionForzado,
        estaAutenticado: !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
