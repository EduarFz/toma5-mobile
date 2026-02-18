import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import {
  PREGUNTAS_TOMA5,
  TITULOS_PASOS,
  obtenerPreguntasPorPaso,
  verificarRequiereAsst,
} from '../utils/preguntasToma5';
import {
  guardarBorradorToma5,
  obtenerBorradorToma5,
  eliminarBorradorToma5,
} from '../utils/storage';
import toma5Service from '../services/toma5.service';

const TOTAL_PASOS = 5;

const Toma5Screen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tareaId } = route.params;

  const [pasoActual, setPasoActual] = useState(1);
  const [respuestas, setRespuestas] = useState({});
  const [procedimientoId, setProcedimientoId] = useState(null);
  const [procedimientos, setProcedimientos] = useState([]);
  const [peligrosAdicionales, setPeligrosAdicionales] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [hayConexion, setHayConexion] = useState(true);
  const [mostrarSelectorProcedimiento, setMostrarSelectorProcedimiento] = useState(false);

  // Monitor de conectividad
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setHayConexion(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Cargar borrador guardado y procedimientos al iniciar
  useEffect(() => {
    inicializar();
  }, []);

  const inicializar = async () => {
    try {
      // Cargar borrador guardado si existe
      const borrador = await obtenerBorradorToma5(tareaId);
      if (borrador) {
        setRespuestas(borrador.respuestas || {});
        setProcedimientoId(borrador.procedimientoId || null);
        setPeligrosAdicionales(borrador.peligrosAdicionales || '');
        setComentarios(borrador.comentarios || '');
        setPasoActual(borrador.pasoActual || 1);
      }

      // Cargar procedimientos desde el backend
      try {
        const datos = await toma5Service.obtenerProcedimientos();
        setProcedimientos(datos.procedimientos || []);
      } catch (err) {
        console.error('No se pudieron cargar procedimientos:', err);
      }
    } catch (error) {
      console.error('Error al inicializar Toma 5:', error);
    } finally {
      setCargando(false);
    }
  };

  // Guardar borrador automáticamente cada vez que cambia algo
  const guardarBorrador = useCallback(async (nuevasRespuestas, nuevoPaso) => {
    await guardarBorradorToma5(tareaId, {
      respuestas: nuevasRespuestas,
      procedimientoId,
      peligrosAdicionales,
      comentarios,
      pasoActual: nuevoPaso || pasoActual,
    });
  }, [tareaId, procedimientoId, peligrosAdicionales, comentarios, pasoActual]);

  // Responder una pregunta
  const responderPregunta = async (codigo, paso, valor) => {
    const nuevasRespuestas = { ...respuestas, [codigo]: { paso, respuesta: valor } };
    setRespuestas(nuevasRespuestas);

    // Si es 2B (¿tiene procedimiento?) y responde SÍ, mostrar selector
    if (codigo === '2B') {
      setMostrarSelectorProcedimiento(valor === true);
      if (valor === false) setProcedimientoId(null);
    }

    await guardarBorrador(nuevasRespuestas, pasoActual);
  };

  // Verificar si todas las preguntas del paso actual están respondidas
  const pasoCompleto = () => {
    if (pasoActual === 5) return true;
    const preguntasPaso = obtenerPreguntasPorPaso(pasoActual);
    return preguntasPaso.every((p) => respuestas[p.codigo] !== undefined);
  };

  // Verificar si la pregunta 2B fue respondida SÍ y no se ha seleccionado procedimiento
  const faltaProcedimiento = () => {
    if (pasoActual !== 2) return false;
    const resp2B = respuestas['2B'];
    return resp2B?.respuesta === true && !procedimientoId;
  };

  // Avanzar al siguiente paso
  const avanzarPaso = async () => {
    if (!pasoCompleto()) {
      Alert.alert('Completa el paso', 'Debes responder todas las preguntas antes de continuar.');
      return;
    }
    if (faltaProcedimiento()) {
      Alert.alert('Selecciona un procedimiento', 'Indicaste que la tarea tiene procedimiento. Debes seleccionarlo.');
      return;
    }
    const nuevoPaso = pasoActual + 1;
    setPasoActual(nuevoPaso);
    await guardarBorrador(respuestas, nuevoPaso);
  };

  // Retroceder al paso anterior
  const retrocederPaso = async () => {
    const nuevoPaso = pasoActual - 1;
    setPasoActual(nuevoPaso);
    await guardarBorrador(respuestas, nuevoPaso);
  };

  // Construir array de respuestas para enviar al backend
  const construirRespuestasParaEnvio = () => {
    return PREGUNTAS_TOMA5.map((pregunta) => ({
      paso: pregunta.paso,
      pregunta: pregunta.codigo,
      respuesta: respuestas[pregunta.codigo]?.respuesta ?? true,
    }));
  };

  // Enviar Toma 5
  const enviarToma5 = async () => {
    if (!hayConexion) {
      Alert.alert(
        'Sin conexión',
        'No tienes conexión a internet. El Toma 5 se enviará automáticamente cuando recuperes la conexión.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    Alert.alert(
      'Enviar Toma 5',
      '¿Confirmas que has revisado todas tus respuestas y deseas enviar el Toma 5?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            try {
              setEnviando(true);
              const respuestasArray = construirRespuestasParaEnvio();
              await toma5Service.enviarToma5({
                tareaId,
                respuestas: respuestasArray,
                procedimientoId,
                peligrosAdicionales,
                comentarios,
              });
              // Eliminar borrador tras envío exitoso
              await eliminarBorradorToma5(tareaId);
              Alert.alert(
                '✅ Toma 5 enviado',
                'Tu Toma 5 fue enviado correctamente. Espera la revisión del supervisor.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (err) {
              const mensaje = err.response?.data?.mensaje || 'Error al enviar el Toma 5. Intenta de nuevo.';
              Alert.alert('Error', mensaje);
            } finally {
              setEnviando(false);
            }
          },
        },
      ]
    );
  };

  // Obtener avisos según respuestas del paso actual
  const obtenerAviso = () => {
    const preguntasPaso = obtenerPreguntasPorPaso(pasoActual);
    const hayNoEnPaso1 = pasoActual === 1 && preguntasPaso.some(
      (p) => respuestas[p.codigo]?.respuesta === false
    );
    const hayNoEnPasos234 = (pasoActual === 2 || pasoActual === 3 || pasoActual === 4) &&
      preguntasPaso.some((p) => respuestas[p.codigo]?.respuesta === false);

    if (hayNoEnPaso1) {
      return {
        tipo: 'advertencia',
        mensaje: '⚠️ Consulte al supervisor/líder de la tarea, es posible que existan peligros no controlados.',
      };
    }
    if (hayNoEnPasos234) {
      return {
        tipo: 'asst',
        mensaje: '⚠️ Diligencie un ASST y consulte con el supervisor para aclaraciones e implemente controles.',
      };
    }
    return null;
  };

  // Renderizar preguntas del paso actual (pasos 1 al 4)
  const renderPreguntas = () => {
    const preguntasPaso = obtenerPreguntasPorPaso(pasoActual);
    return preguntasPaso.map((pregunta) => {
      const respuesta = respuestas[pregunta.codigo];
      const respondida = respuesta !== undefined;
      const esSI = respondida && respuesta.respuesta === true;
      const esNO = respondida && respuesta.respuesta === false;

      return (
        <View key={pregunta.codigo} style={styles.preguntaContenedor}>
          <Text style={styles.preguntaTexto}>{pregunta.texto}</Text>
          <View style={styles.botonesRespuesta}>
            <TouchableOpacity
              style={[styles.botonRespuesta, esSI && styles.botonSIActivo]}
              onPress={() => responderPregunta(pregunta.codigo, pregunta.paso, true)}
            >
              <Text style={[styles.botonRespuestaTexto, esSI && styles.botonRespuestaTextoActivo]}>
                SÍ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botonRespuesta, esNO && styles.botonNOActivo]}
              onPress={() => responderPregunta(pregunta.codigo, pregunta.paso, false)}
            >
              <Text style={[styles.botonRespuestaTexto, esNO && styles.botonRespuestaTextoActivo]}>
                NO
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selector de procedimiento bajo pregunta 2B */}
          {pregunta.codigo === '2B' && mostrarSelectorProcedimiento && (
            <View style={styles.selectorProcedimiento}>
              <Text style={styles.selectorTitulo}>Selecciona el procedimiento:</Text>
              {procedimientos.length === 0 ? (
                <Text style={styles.sinProcedimientos}>No hay procedimientos disponibles.</Text>
              ) : (
                procedimientos.map((proc) => (
                  <TouchableOpacity
                    key={proc.id}
                    style={[
                      styles.opcionProcedimiento,
                      procedimientoId === proc.id && styles.opcionProcedimientoActiva,
                    ]}
                    onPress={() => setProcedimientoId(proc.id)}
                  >
                    <Text
                      style={[
                        styles.opcionProcedimientoTexto,
                        procedimientoId === proc.id && styles.opcionProcedimientoTextoActivo,
                      ]}
                    >
                      {proc.nombre}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>
      );
    });
  };

  // Renderizar Paso 5 — confirmación + peligros + comentarios
  const renderPaso5 = () => {
    const requiereAsst = verificarRequiereAsst(
      Object.entries(respuestas).map(([codigo, val]) => ({
        paso: val.paso,
        respuesta: val.respuesta,
      }))
    );

    return (
      <View>
        {/* Resumen */}
        <View style={styles.resumenContenedor}>
          <Text style={styles.resumenTitulo}>📋 Resumen de tu Toma 5</Text>
          {requiereAsst ? (
            <View style={styles.avisoAsst}>
              <Text style={styles.avisoAsstTexto}>
                ⚠️ Has marcado al menos una respuesta NO en los pasos 2, 3 o 4.{'\n'}
                Deberás diligenciar un ASST después de la aprobación del supervisor.
              </Text>
            </View>
          ) : (
            <View style={styles.avisoOk}>
              <Text style={styles.avisoOkTexto}>
                ✅ No se requiere ASST. Todas las respuestas críticas son SÍ.
              </Text>
            </View>
          )}
        </View>

        {/* Confirmaciones del Paso 5 */}
        <View style={styles.confirmacionContenedor}>
          <Text style={styles.confirmacionTexto}>
            1. Si marcaste una casilla NO en los pasos 2, 3 y 4, es posible que existan peligros no controlados. Debes realizar un ASST.
          </Text>
          <Text style={styles.confirmacionTexto}>
            2. En caso de que identifiques cambios en el entorno o en la ejecución de la actividad/tarea, debes PARAR, realizar nuevamente el Toma 5 e implementar los controles necesarios.
          </Text>
          <Text style={styles.confirmacionTexto}>
            3. Si tu única herramienta es el Toma 5 y un ASST no es requerido, incluye en el Toma 5 los peligros no tenidos en cuenta y sus controles. Si no puedes identificar un control adecuado, no comiences la tarea e informa a tu supervisor.
          </Text>
        </View>

        {/* Peligros y controles adicionales */}
        <View style={styles.campoTexto}>
          <Text style={styles.campoEtiqueta}>
            Peligros y controles adicionales{' '}
            <Text style={styles.opcional}>(opcional)</Text>
          </Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            maxLength={500}
            placeholder="Describe peligros adicionales no contemplados y sus controles..."
            placeholderTextColor="#9CA3AF"
            value={peligrosAdicionales}
            onChangeText={setPeligrosAdicionales}
          />
          <Text style={styles.contador}>{peligrosAdicionales.length}/500</Text>
        </View>

        {/* Comentarios */}
        <View style={styles.campoTexto}>
          <Text style={styles.campoEtiqueta}>
            Comentarios al supervisor{' '}
            <Text style={styles.opcional}>(opcional)</Text>
          </Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Observaciones adicionales para el supervisor..."
            placeholderTextColor="#9CA3AF"
            value={comentarios}
            onChangeText={setComentarios}
          />
        </View>
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.cargandoTexto}>Cargando formulario...</Text>
      </View>
    );
  }

  const aviso = obtenerAviso();

  return (
    <View style={styles.contenedor}>
      {/* Banner de conectividad */}
      {!hayConexion && (
        <View style={styles.bannerSinConexion}>
          <Text style={styles.bannerTexto}>🟠 Sin conexión — guardando localmente</Text>
        </View>
      )}

      {/* Encabezado */}
      <View style={styles.encabezado}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonVolver}>
          <Text style={styles.botonVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.tituloEncabezado}>Toma 5</Text>
      </View>

      {/* Indicador de pasos */}
      <View style={styles.indicadorPasos}>
        {[1, 2, 3, 4, 5].map((paso) => (
          <View
            key={paso}
            style={[
              styles.indicadorPaso,
              paso === pasoActual && styles.indicadorPasoActual,
              paso < pasoActual && styles.indicadorPasoCompletado,
            ]}
          >
            <Text
              style={[
                styles.indicadorPasoTexto,
                (paso === pasoActual || paso < pasoActual) && styles.indicadorPasoTextoActivo,
              ]}
            >
              {paso < pasoActual ? '✓' : paso}
            </Text>
          </View>
        ))}
      </View>

      {/* Título del paso */}
      <View style={styles.tituloPasoContenedor}>
        <Text style={styles.tituloPaso}>{TITULOS_PASOS[pasoActual]}</Text>
      </View>

      {/* Contenido del paso */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContenido}>
        {pasoActual < 5 ? renderPreguntas() : renderPaso5()}

        {/* Aviso según respuestas */}
        {aviso && (
          <View style={[
            styles.aviso,
            aviso.tipo === 'asst' ? styles.avisoAsstColor : styles.avisoAdvertenciaColor
          ]}>
            <Text style={styles.avisoTexto}>{aviso.mensaje}</Text>
          </View>
        )}
      </ScrollView>

      {/* Botones de navegación */}
      <View style={styles.navegacion}>
        {pasoActual > 1 && (
          <TouchableOpacity style={styles.botonAnterior} onPress={retrocederPaso}>
            <Text style={styles.botonAnteriorTexto}>← Anterior</Text>
          </TouchableOpacity>
        )}

        {pasoActual < TOTAL_PASOS ? (
          <TouchableOpacity
            style={[styles.botonSiguiente, !pasoCompleto() && styles.botonDeshabilitado]}
            onPress={avanzarPaso}
          >
            <Text style={styles.botonSiguienteTexto}>Siguiente →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.botonEnviar, enviando && styles.botonDeshabilitado]}
            onPress={enviarToma5}
            disabled={enviando}
          >
            {enviando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.botonEnviarTexto}>Enviar Toma 5 ✅</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  bannerSinConexion: {
    backgroundColor: '#F97316',
    paddingVertical: 8,
    alignItems: 'center',
  },
  bannerTexto: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  encabezado: {
    backgroundColor: '#1E3A8A',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  botonVolver: {
    marginRight: 16,
  },
  botonVolverTexto: {
    color: '#BFDBFE',
    fontSize: 16,
  },
  tituloEncabezado: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  indicadorPasos: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingBottom: 16,
    gap: 8,
  },
  indicadorPaso: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B5998',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicadorPasoActual: {
    backgroundColor: '#FFFFFF',
  },
  indicadorPasoCompletado: {
    backgroundColor: '#10B981',
  },
  indicadorPasoTexto: {
    color: '#BFDBFE',
    fontWeight: 'bold',
    fontSize: 14,
  },
  indicadorPasoTextoActivo: {
    color: '#1E3A8A',
  },
  tituloPasoContenedor: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
  },
  tituloPaso: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
  },
  scroll: {
    flex: 1,
  },
  scrollContenido: {
    padding: 16,
    paddingBottom: 32,
  },
  preguntaContenedor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  preguntaTexto: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 12,
  },
  botonesRespuesta: {
    flexDirection: 'row',
    gap: 12,
  },
  botonRespuesta: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  botonSIActivo: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  botonNOActivo: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  botonRespuestaTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  botonRespuestaTextoActivo: {
    color: '#1F2937',
  },
  selectorProcedimiento: {
    marginTop: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  selectorTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  sinProcedimientos: {
    fontSize: 13,
    color: '#6B7280',
  },
  opcionProcedimiento: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  opcionProcedimientoActiva: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  opcionProcedimientoTexto: {
    fontSize: 14,
    color: '#1F2937',
  },
  opcionProcedimientoTextoActivo: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  aviso: {
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
  },
  avisoAsstColor: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  avisoAdvertenciaColor: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  avisoTexto: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  resumenContenedor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resumenTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  avisoAsst: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  avisoAsstTexto: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  avisoOk: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  avisoOkTexto: {
    fontSize: 14,
    color: '#065F46',
  },
  confirmacionContenedor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  confirmacionTexto: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 10,
  },
  campoTexto: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  campoEtiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  opcional: {
    fontWeight: '400',
    color: '#9CA3AF',
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  contador: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  navegacion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  botonAnterior: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1E3A8A',
    alignItems: 'center',
  },
  botonAnteriorTexto: {
    color: '#1E3A8A',
    fontSize: 15,
    fontWeight: '600',
  },
  botonSiguiente: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
  },
  botonEnviar: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  botonSiguienteTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  botonEnviarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  cargandoTexto: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default Toma5Screen;
