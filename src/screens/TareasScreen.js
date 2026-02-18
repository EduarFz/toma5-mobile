import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { ESTADOS_TAREA } from '../utils/constants';
import api from '../services/api';


// Colores por estado
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

const TareasScreen = () => {
  const { usuario } = useAuth();
  const navigation = useNavigation();
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const obtenerFechaHoy = () => {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  };

  const cargarTareas = useCallback(async () => {
    try {
      setError('');
      const fecha = obtenerFechaHoy();
      const respuesta = await api.get(`/tareas?fecha=${fecha}`);
      setTareas(respuesta.data.tareas);
    } catch (err) {
      setError('No se pudieron cargar las tareas. Verifica tu conexión.');
      console.error('Error al cargar tareas:', err);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargarTareas();
  }, [cargarTareas]);

  const onRefrescar = () => {
    setRefrescando(true);
    cargarTareas();
  };

  const renderTarea = ({ item }) => {
    const colores = colorEstado[item.estado] || colorEstado[ESTADOS_TAREA.CANCELADA_AUTOMATICAMENTE];
    return (
      <TouchableOpacity style={styles.tarjeta} onPress={() => navigation.navigate('DetalleTarea', { tareaId: item.id })}>
        {/* Estado badge */}
        <View style={[styles.estadoBadge, { backgroundColor: colores.fondo, borderColor: colores.borde }]}>
          <Text style={[styles.estadoTexto, { color: colores.texto }]}>
            {textoEstado[item.estado] || item.estado}
          </Text>
        </View>

        {/* Descripción */}
        <Text style={styles.descripcion}>{item.descripcion}</Text>

        {/* Lugar */}
        {item.lugar ? (
          <Text style={styles.lugar}>📍 {item.lugar}</Text>
        ) : null}

        {/* Creada por */}
        <Text style={styles.creadaPor}>
          {item.creadaPorTrabajador ? '👷 Creada por ti' : '👔 Asignada por supervisor'}
        </Text>
      </TouchableOpacity>
    );
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.cargandoTexto}>Cargando tareas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      {/* Encabezado */}
      <View style={styles.encabezado}>
  <View style={styles.encabezadoFila}>
    <View>
      <Text style={styles.saludo}>Hola, {usuario?.nombreCompleto?.split(' ')[0]}</Text>
      <Text style={styles.fecha}>
        {new Date().toLocaleDateString('es-CO', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
        })}
      </Text>
    </View>
    <TouchableOpacity
      style={styles.botonNuevaTarea}
      onPress={() => navigation.navigate('CrearTarea')}
    >
      <Text style={styles.botonNuevaTareaTexto}>+ Nueva</Text>
    </TouchableOpacity>
  </View>
</View>

      {/* Error */}
      {error ? (
        <View style={styles.errorContenedor}>
          <Text style={styles.errorTexto}>{error}</Text>
        </View>
      ) : null}

      {/* Lista de tareas */}
      <FlatList
        data={tareas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTarea}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefrescar} colors={['#1E3A8A']} />
        }
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.vacioIcono}>📋</Text>
            <Text style={styles.vacioTexto}>No tienes tareas para hoy</Text>
          </View>
        }
      />
    </View>
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
  },
  saludo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  fecha: {
    fontSize: 14,
    color: '#BFDBFE',
    marginTop: 4,
    textTransform: 'capitalize',
  },
encabezadoFila: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
botonNuevaTarea: {
  backgroundColor: '#FFFFFF',
  borderRadius: 8,
  paddingHorizontal: 14,
  paddingVertical: 8,
},
botonNuevaTareaTexto: {
  color: '#1E3A8A',
  fontWeight: 'bold',
  fontSize: 14,
},


  lista: {
    padding: 16,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  estadoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  descripcion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  lugar: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  creadaPor: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
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
  errorContenedor: {
    backgroundColor: '#FEE2E2',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderColor: '#FCA5A5',
    borderWidth: 1,
  },
  errorTexto: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  vacio: {
    alignItems: 'center',
    paddingTop: 60,
  },
  vacioIcono: {
    fontSize: 48,
    marginBottom: 12,
  },
  vacioTexto: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default TareasScreen;
