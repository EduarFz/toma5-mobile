import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ESTADOS_TAREA } from '../utils/constants';
import api from '../services/api';

const colorEstado = {
  [ESTADOS_TAREA.PENDIENTE]: { fondo: '#FEF3C7', texto: '#92400E', borde: '#F59E0B' },
  [ESTADOS_TAREA.TOMA5_ENVIADO]: { fondo: '#DBEAFE', texto: '#1E40AF', borde: '#3B82F6' },
  [ESTADOS_TAREA.EN_REVISION]: { fondo: '#EDE9FE', texto: '#5B21B6', borde: '#8B5CF6' },
  [ESTADOS_TAREA.PENDIENTE_ASST]: { fondo: '#FEF3C7', texto: '#92400E', borde: '#F59E0B' },
  [ESTADOS_TAREA.LISTA_PARA_INICIAR]: { fondo: '#D1FAE5', texto: '#065F46', borde: '#10B981' },
  [ESTADOS_TAREA.CANCELADA]: { fondo: '#FEE2E2', texto: '#991B1B', borde: '#EF4444' },
  [ESTADOS_TAREA.CANCELADA_AUTOMATICAMENTE]: { fondo: '#F3F4F6', texto: '#6B7280', borde: '#9CA3AF' },
};

const textoEstado = {
  [ESTADOS_TAREA.PENDIENTE]: 'Pendiente',
  [ESTADOS_TAREA.TOMA5_ENVIADO]: 'Toma 5 Enviado',
  [ESTADOS_TAREA.EN_REVISION]: 'En Revisión',
  [ESTADOS_TAREA.PENDIENTE_ASST]: 'Pendiente ASST',
  [ESTADOS_TAREA.LISTA_PARA_INICIAR]: 'Lista para Iniciar ✅',
  [ESTADOS_TAREA.CANCELADA]: 'Cancelada',
  [ESTADOS_TAREA.CANCELADA_AUTOMATICAMENTE]: 'Cancelada Automáticamente',
};

const DetalleTareaScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tareaId } = route.params;

  const [tarea, setTarea] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarTarea = useCallback(async () => {
    try {
      setError('');
      const respuesta = await api.get(`/tareas/${tareaId}`);
      setTarea(respuesta.data.tarea);
    } catch (err) {
      setError('No se pudo cargar la tarea.');
      console.error('Error al cargar tarea:', err);
    } finally {
      setCargando(false);
    }
  }, [tareaId]);

  useEffect(() => {
    cargarTarea();
  }, [cargarTarea]);

  // Determinar qué acción puede hacer el trabajador según el estado
  const renderAccion = () => {
    if (!tarea) return null;

    switch (tarea.estado) {
      case ESTADOS_TAREA.PENDIENTE:
        return (
          <TouchableOpacity
            style={styles.botonPrincipal}
            onPress={() => navigation.push('Toma5', { tareaId: tarea.id })}
          >
            <Text style={styles.botonPrincipalTexto}>📝 Diligenciar Toma 5</Text>
          </TouchableOpacity>
        );

      case ESTADOS_TAREA.EN_REVISION:
        return (
          <>
            <View style={styles.avisoRevision}>
              <Text style={styles.avisoRevisionTexto}>
                ⚠️ El supervisor devolvió tu Toma 5 para correcciones.
              </Text>
              {tarea.toma5?.observacionesSupervisor ? (
                <Text style={styles.observaciones}>
                  Observaciones: {tarea.toma5.observacionesSupervisor}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.botonPrincipal}
              onPress={() => navigation.push('Toma5', { tareaId: tarea.id })}
            >
              <Text style={styles.botonPrincipalTexto}>📝 Rediligenciar Toma 5</Text>
            </TouchableOpacity>
          </>
        );

      case ESTADOS_TAREA.TOMA5_ENVIADO:
        return (
          <View style={styles.avisoEspera}>
            <Text style={styles.avisoEsperaTexto}>
              ⏳ Tu Toma 5 está en revisión. Espera la respuesta del supervisor.
            </Text>
          </View>
        );

      case ESTADOS_TAREA.PENDIENTE_ASST:
        return (
          <TouchableOpacity
            style={styles.botonPrincipal}
            onPress={() => navigation.push('Asst', { tareaId: tarea.id })}
          >
            <Text style={styles.botonPrincipalTexto}>📷 Subir fotos del ASST</Text>
          </TouchableOpacity>
        );

      case ESTADOS_TAREA.LISTA_PARA_INICIAR:
        return (
          <View style={styles.avisoLista}>
            <Text style={styles.avisoListaTexto}>
              ✅ Protocolos completados. Puedes iniciar la tarea.
            </Text>
          </View>
        );

      case ESTADOS_TAREA.CANCELADA:
        return (
          <View style={styles.avisoCancelada}>
            <Text style={styles.avisoCanceladaTexto}>
              ❌ Esta tarea fue cancelada por el supervisor.
            </Text>
          </View>
        );

      case ESTADOS_TAREA.CANCELADA_AUTOMATICAMENTE:
        return (
          <View style={styles.avisoCancelada}>
            <Text style={styles.avisoCanceladaTexto}>
              ❌ Esta tarea fue cancelada automáticamente por no completar los protocolos a tiempo.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.cargandoTexto}>Cargando tarea...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.errorTexto}>{error}</Text>
        <TouchableOpacity style={styles.botonReintentar} onPress={cargarTarea}>
          <Text style={styles.botonReintentarTexto}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const colores = colorEstado[tarea.estado] || colorEstado[ESTADOS_TAREA.CANCELADA_AUTOMATICAMENTE];

  return (
    <ScrollView
      style={styles.contenedor}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={cargarTarea} colors={['#1E3A8A']} />
      }
    >
      {/* Encabezado */}
      <View style={styles.encabezado}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonVolver}>
          <Text style={styles.botonVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.tituloEncabezado}>Detalle de Tarea</Text>
      </View>

      <View style={styles.contenido}>
        {/* Estado */}
        <View style={[styles.estadoBadge, { backgroundColor: colores.fondo, borderColor: colores.borde }]}>
          <Text style={[styles.estadoTexto, { color: colores.texto }]}>
            {textoEstado[tarea.estado] || tarea.estado}
          </Text>
        </View>

        {/* Descripción */}
        <View style={styles.seccion}>
          <Text style={styles.etiqueta}>Descripción</Text>
          <Text style={styles.valor}>{tarea.descripcion}</Text>
        </View>

        {/* Lugar */}
        {tarea.lugar ? (
          <View style={styles.seccion}>
            <Text style={styles.etiqueta}>📍 Lugar</Text>
            <Text style={styles.valor}>{tarea.lugar}</Text>
          </View>
        ) : null}

        {/* Supervisor */}
        {tarea.supervisor ? (
          <View style={styles.seccion}>
            <Text style={styles.etiqueta}>👔 Supervisor</Text>
            <Text style={styles.valor}>{tarea.supervisor.nombreCompleto}</Text>
          </View>
        ) : null}

        {/* Creada por */}
        <View style={styles.seccion}>
          <Text style={styles.etiqueta}>Creada por</Text>
          <Text style={styles.valor}>
            {tarea.creadaPorTrabajador ? '👷 Por ti' : '👔 Por el supervisor'}
          </Text>
        </View>

        {/* Toma 5 info */}
        {tarea.toma5 ? (
          <View style={styles.seccion}>
            <Text style={styles.etiqueta}>Toma 5</Text>
            <Text style={styles.valor}>
              {tarea.toma5.aprobado === true
                ? '✅ Aprobado'
                : tarea.toma5.aprobado === false
                ? '❌ Rechazado'
                : '⏳ En revisión'}
            </Text>
            {tarea.toma5.requiereAsst ? (
              <Text style={styles.requiereAsst}>⚠️ Requiere ASST</Text>
            ) : null}
            {tarea.toma5.procedimiento ? (
              <Text style={styles.procedimiento}>
                📄 Procedimiento: {tarea.toma5.procedimiento.nombre}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Acción disponible */}
        <View style={styles.seccionAccion}>{renderAccion()}</View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  encabezado: {
    backgroundColor: '#1E3A8A',
    paddingTop: 56,
    paddingBottom: 20,
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
  contenido: {
    padding: 16,
  },
  estadoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  estadoTexto: {
    fontSize: 14,
    fontWeight: '600',
  },
  seccion: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  valor: {
    fontSize: 16,
    color: '#1F2937',
  },
  requiereAsst: {
    fontSize: 14,
    color: '#D97706',
    marginTop: 6,
  },
  procedimiento: {
    fontSize: 14,
    color: '#1E40AF',
    marginTop: 6,
  },
  seccionAccion: {
    marginTop: 8,
    marginBottom: 32,
  },
  botonPrincipal: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  botonPrincipalTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  avisoRevision: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B5CF6',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  avisoRevisionTexto: {
    color: '#5B21B6',
    fontSize: 14,
    fontWeight: '600',
  },
  observaciones: {
    color: '#5B21B6',
    fontSize: 13,
    marginTop: 8,
  },
  avisoEspera: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  avisoEsperaTexto: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '600',
  },
  avisoLista: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  avisoListaTexto: {
    color: '#065F46',
    fontSize: 14,
    fontWeight: '600',
  },
  avisoCancelada: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  avisoCanceladaTexto: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '600',
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 24,
  },
  cargandoTexto: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorTexto: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  botonReintentar: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  botonReintentarTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DetalleTareaScreen;
