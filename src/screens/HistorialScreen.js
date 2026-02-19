import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const colorEstado = {
  PENDIENTE:                   { fondo: '#FEF3C7', texto: '#92400E', borde: '#F59E0B' },
  TOMA5ENVIADO:                { fondo: '#DBEAFE', texto: '#1E40AF', borde: '#3B82F6' },
  ENREVISION:                  { fondo: '#EDE9FE', texto: '#5B21B6', borde: '#8B5CF6' },
  PENDIENTE_ASST:              { fondo: '#FEF3C7', texto: '#92400E', borde: '#F59E0B' },
  LISTA_PARA_INICIAR:          { fondo: '#D1FAE5', texto: '#065F46', borde: '#10B981' },
  CANCELADA:                   { fondo: '#FEE2E2', texto: '#991B1B', borde: '#EF4444' },
  CANCELADA_AUTOMATICAMENTE:   { fondo: '#F3F4F6', texto: '#6B7280', borde: '#9CA3AF' },
};

const textoEstado = {
  PENDIENTE:                   'Pendiente',
  TOMA5ENVIADO:                'Toma 5 Enviado',
  ENREVISION:                  'En Revisión',
  PENDIENTE_ASST:              'Pendiente ASST',
  LISTA_PARA_INICIAR:          'Lista para Iniciar',
  CANCELADA:                   'Cancelada',
  CANCELADA_AUTOMATICAMENTE:   'Cancelada Automáticamente',
};

const HistorialScreen = () => {
  const navigation = useNavigation();
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const cargarHistorial = useCallback(async () => {
    try {
      setError('');
      const respuesta = await api.get('/tareas/historial');
      setTareas(respuesta.data.tareas || []);
    } catch (err) {
      if (err.response?.status === 401) return;
      setError('No se pudo cargar el historial. Verifica tu conexión.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  // Cargar al montar
  React.useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  const onRefrescar = () => {
    setRefrescando(true);
    cargarHistorial();
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const renderTarea = ({ item }) => {
    const colores = colorEstado[item.estado] || colorEstado['CANCELADA'];
    return (
      <TouchableOpacity
        style={styles.tarjeta}
        onPress={() => navigation.navigate('Tareas', {
          screen: 'DetalleTarea',
          params: { tareaId: item.id },
        })}
      >
        {/* Estado badge */}
        <View style={[styles.estadoBadge, {
          backgroundColor: colores.fondo,
          borderColor: colores.borde,
        }]}>
          <Text style={[styles.estadoTexto, { color: colores.texto }]}>
            {textoEstado[item.estado] || item.estado}
          </Text>
        </View>

        {/* Descripción */}
        <Text style={styles.descripcion}>{item.descripcion}</Text>

        {/* Fecha y lugar */}
        <View style={styles.metaDatos}>
          <Text style={styles.fecha}>📅 {formatearFecha(item.fechaTarea)}</Text>
          {item.lugar ? (
            <Text style={styles.lugar}>📍 {item.lugar}</Text>
          ) : null}
        </View>

        {/* Creada por */}
        <Text style={styles.creadaPor}>
          {item.creadaPorTrabajador ? 'Creada por ti' : 'Asignada por supervisor'}
        </Text>
      </TouchableOpacity>
    );
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.cargandoTexto}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      {/* Encabezado */}
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Historial de Tareas</Text>
        <Text style={styles.subtitulo}>Todas tus tareas registradas</Text>
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorContenedor}>
          <Text style={styles.errorTexto}>{error}</Text>
          <TouchableOpacity style={styles.botonReintentar} onPress={cargarHistorial}>
            <Text style={styles.botonReintentarTexto}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Lista */}
      <FlatList
        data={tareas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTarea}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefrescar}
            colors={['#1E3A8A']}
          />
        }
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.vacioIcono}>📋</Text>
            <Text style={styles.vacioTexto}>No hay tareas en el historial</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F3F4F6' },
  encabezado: {
    backgroundColor: '#1E3A8A',
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  subtitulo: { fontSize: 14, color: '#BFDBFE', marginTop: 4 },
  lista: { padding: 16 },
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
  estadoTexto: { fontSize: 12, fontWeight: '600' },
  descripcion: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  metaDatos: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  fecha: { fontSize: 13, color: '#6B7280' },
  lugar: { fontSize: 13, color: '#6B7280' },
  creadaPor: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  cargandoTexto: { marginTop: 12, fontSize: 16, color: '#6B7280' },
  errorContenedor: {
    backgroundColor: '#FEE2E2', margin: 16, padding: 12,
    borderRadius: 8, borderColor: '#FCA5A5', borderWidth: 1,
  },
  errorTexto: { color: '#DC2626', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  botonReintentar: {
    backgroundColor: '#1E3A8A', borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'center',
  },
  botonReintentarTexto: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  vacio: { alignItems: 'center', paddingTop: 60 },
  vacioIcono: { fontSize: 48, marginBottom: 12 },
  vacioTexto: { fontSize: 16, color: '#6B7280' },
});

export default HistorialScreen;
