import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

// Guardar token JWT
export const guardarToken = async (token) => {
  await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
};

// Obtener token JWT
export const obtenerToken = async () => {
  return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
};

// Guardar datos del usuario
export const guardarUsuario = async (usuario) => {
  await AsyncStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(usuario));
};

// Obtener datos del usuario
export const obtenerUsuario = async () => {
  const datos = await AsyncStorage.getItem(STORAGE_KEYS.USUARIO);
  return datos ? JSON.parse(datos) : null;
};

// Guardar borrador del Toma 5 (para modo offline)
export const guardarBorradorToma5 = async (tareaId, datos) => {
  const clave = `${STORAGE_KEYS.TOMA5_BORRADOR}_${tareaId}`;
  await AsyncStorage.setItem(clave, JSON.stringify(datos));
};

// Obtener borrador del Toma 5
export const obtenerBorradorToma5 = async (tareaId) => {
  const clave = `${STORAGE_KEYS.TOMA5_BORRADOR}_${tareaId}`;
  const datos = await AsyncStorage.getItem(clave);
  return datos ? JSON.parse(datos) : null;
};

// Eliminar borrador del Toma 5 (después de enviarlo exitosamente)
export const eliminarBorradorToma5 = async (tareaId) => {
  const clave = `${STORAGE_KEYS.TOMA5_BORRADOR}_${tareaId}`;
  await AsyncStorage.removeItem(clave);
};

// Limpiar toda la sesión (logout)
export const limpiarSesion = async () => {
  await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  await AsyncStorage.removeItem(STORAGE_KEYS.USUARIO);
};
