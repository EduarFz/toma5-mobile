import api from './api';

// Obtener tareas del día actual
const obtenerTareasHoy = async () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  const fecha = `${anio}-${mes}-${dia}`;

  const respuesta = await api.get(`/tareas?fecha=${fecha}`);
  return respuesta.data;
};

// Obtener detalle de una tarea por ID
const obtenerTarea = async (tareaId) => {
  const respuesta = await api.get(`/tareas/${tareaId}`);
  return respuesta.data;
};

const crearTarea = async (descripcion, lugar, trabajadorId) => {
  // La tarea del trabajador siempre es para hoy
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  const fechaTarea = `${anio}-${mes}-${dia}`;

  const respuesta = await api.post('/tareas', {
    descripcion,
    lugar: lugar || undefined,
    trabajadorId: trabajadorId,
    fechaTarea: fechaTarea,
  });
  return respuesta.data;
};



export default { obtenerTareasHoy, obtenerTarea, crearTarea };
