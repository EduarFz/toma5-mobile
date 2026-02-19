import api from './api';

const subirAsst = async (tareaId, foto1Base64, foto2Base64) => {
  try {
    const respuesta = await api.post('/asst', {
      tareaId,
      foto1: foto1Base64,
      foto2: foto2Base64,
    });
    return respuesta.data;
  } catch (error) {
    console.log('Error en subirAsst:', JSON.stringify(error.response?.data || error, null, 2));
    throw error;
  }
};

export default { subirAsst };
