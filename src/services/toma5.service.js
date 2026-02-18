import api from './api';

// Enviar Toma 5 diligenciado
// respuestas: array de { paso, pregunta, respuesta (boolean) }
const enviarToma5 = async ({ tareaId, respuestas, procedimientoId, peligrosAdicionales, comentarios }) => {
  const respuesta = await api.post('/toma5', {
    tareaId,
    respuestas,
    procedimientoId: procedimientoId || undefined,
    peligrosAdicionales: peligrosAdicionales || undefined,
    comentarios: comentarios || undefined,
  });
  return respuesta.data;
};

// Obtener procedimientos activos para el selector del Paso 2
const obtenerProcedimientos = async () => {
  const respuesta = await api.get('/procedimientos/activos');
  return respuesta.data;
};

export default { enviarToma5, obtenerProcedimientos };
