// Preguntas exactas del formulario físico Toma 5 - SYS-ES03-FO01
// Organizadas por paso y con su código de pregunta

export const PREGUNTAS_TOMA5 = [
  // PASO 1 — Pienso en mis condiciones y las de la actividad/tarea
  {
    paso: 1,
    codigo: '1A',
    texto: '¿Me encuentro sin la influencia del alcohol, drogas y/o medicamentos que afecten mi capacidad para hacer la actividad/tarea?',
  },
  {
    paso: 1,
    codigo: '1B',
    texto: '¿Tengo las competencias, estoy autorizado/certificado para realizar la actividad/tarea?',
  },
  {
    paso: 1,
    codigo: '1C',
    texto: '¿Identifico en el área de trabajo la presencia de otras personas y les informé de mi actividad/tarea?',
  },
  {
    paso: 1,
    codigo: '1D',
    texto: '¿Tengo los EPP adecuados para la tarea, sé cómo usarlos correctamente y están en buen estado?',
  },
  {
    paso: 1,
    codigo: '1E',
    texto: '¿Cuento con las herramientas y equipos para realizar la tarea y sé cuándo están en buen estado?',
  },
  {
    paso: 1,
    codigo: '1F',
    texto: '¿Tengo los controles para evitar un impacto negativo en el medioambiente y/o comunidad? (Ejemplo: Material particulado, derrames, incendios)',
  },
  {
    paso: 1,
    codigo: '1G',
    texto: '¿Conozco y tengo los medios para activar el plan de respuesta ante una emergencia?',
  },
  {
    paso: 1,
    codigo: '1H',
    texto: '¿Conozco y cumplo los Comportamientos que Salvan Vidas?',
  },

  // PASO 2 — Identifico el peligro
  {
    paso: 2,
    codigo: '2A',
    texto: '¿He identificado las fuentes de energías presentes y/o almacenadas durante la tarea y tengo los elementos para realizar su aislamiento/bloqueo?',
  },
  {
    paso: 2,
    codigo: '2B',
    texto: '¿Voy a realizar una actividad que tiene procedimiento/instructivo? ¿Lo conozco y entiendo los pasos?',
  },
  {
    paso: 2,
    codigo: '2C',
    texto: '¿Ejecutaré una tarea/actividad rutinaria?',
  },
  {
    paso: 2,
    codigo: '2D',
    texto: '¿He realizado antes esta tarea bajo condiciones y entornos similares, y entiendo su alcance?',
  },
  {
    paso: 2,
    codigo: '2E',
    texto: '¿Puedo realizar mi tarea sin diligenciar un permiso de trabajo? (Ej. Alturas, Aislamiento Grupal, Espacio Confinado, entre otros)',
  },

  // PASO 3 — Evalúo el riesgo
  {
    paso: 3,
    codigo: '3A',
    texto: '¿Sé en qué momento y bajo qué condiciones debo PARAR la actividad/tarea, analizar los riesgos y definir un nuevo PLAN SEGURO?',
  },
  {
    paso: 3,
    codigo: '3B',
    texto: '¿Tengo claro los riesgos asociados a la actividad/tarea, trabajos simultáneos y del entorno?',
  },

  // PASO 4 — Confirmo los controles requeridos
  {
    paso: 4,
    codigo: '4A',
    texto: '¿Conozco el(los) Protocolo(s) de Peligros Fatales y los controles críticos que aplican a la actividad/tarea que voy a realizar?',
  },
  {
    paso: 4,
    codigo: '4B',
    texto: '¿Confirmo que he realizado una evaluación de riesgos y cuento con los controles requeridos?',
  },
];

// Títulos de cada paso
export const TITULOS_PASOS = {
  1: 'Paso 1: Pienso en mis condiciones y las de la actividad/tarea',
  2: 'Paso 2: Identifico el peligro',
  3: 'Paso 3: Evalúo el riesgo',
  4: 'Paso 4: Confirmo los controles requeridos',
  5: 'Paso 5: Estoy listo para trabajar con salud y seguridad',
};

// Obtener preguntas de un paso específico
export const obtenerPreguntasPorPaso = (paso) => {
  return PREGUNTAS_TOMA5.filter((p) => p.paso === paso);
};

// Verificar si se requiere ASST según las respuestas
// Se requiere si hay al menos un NO en pasos 2, 3 o 4
export const verificarRequiereAsst = (respuestas) => {
  return respuestas.some(
    (r) => (r.paso === 2 || r.paso === 3 || r.paso === 4) && r.respuesta === false
  );
};
