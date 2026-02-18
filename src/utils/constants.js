// URL del backend - apunta a la IP de tu PC en la red local
export const API_URL = 'http://192.168.1.40:3000/api';
export const SOCKET_URL = 'http://192.168.1.40:3000';

// Estados de tarea - exactamente igual que en el backend
export const ESTADOS_TAREA = {
  PENDIENTE: 'PENDIENTE',
  TOMA5_ENVIADO: 'TOMA5_ENVIADO',
  EN_REVISION: 'EN_REVISION',
  PENDIENTE_ASST: 'PENDIENTE_ASST',
  LISTA_PARA_INICIAR: 'LISTA_PARA_INICIAR',
  CANCELADA: 'CANCELADA',
  CANCELADA_AUTOMATICAMENTE: 'CANCELADA_AUTOMATICAMENTE',
};

// Roles
export const ROLES = {
  TRABAJADOR: 'TRABAJADOR',
  SUPERVISOR: 'SUPERVISOR',
};

// Claves de AsyncStorage
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USUARIO: 'usuario',
  TOMA5_BORRADOR: 'toma5_borrador',
};
