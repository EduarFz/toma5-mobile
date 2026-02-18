import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const PerfilScreen = () => {
  const { usuario, logout } = useAuth();
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              setCerrandoSesion(true);
              await logout();
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            } finally {
              setCerrandoSesion(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.contenedor}>
      {/* Encabezado */}
      <View style={styles.encabezado}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>
            {usuario?.nombreCompleto?.charAt(0) || '?'}
          </Text>
        </View>
        <Text style={styles.nombre}>{usuario?.nombreCompleto}</Text>
        <Text style={styles.cargo}>{usuario?.cargo || 'Técnico Operador'}</Text>
      </View>

      {/* Datos del usuario */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Información Personal</Text>

        <View style={styles.fila}>
          <Text style={styles.etiqueta}>Cédula</Text>
          <Text style={styles.valor}>{usuario?.cedula}</Text>
        </View>

        <View style={styles.fila}>
          <Text style={styles.etiqueta}>Carnet</Text>
          <Text style={styles.valor}>{usuario?.carnet}</Text>
        </View>

        <View style={styles.fila}>
          <Text style={styles.etiqueta}>Turno</Text>
          <Text style={styles.valor}>{usuario?.turno}</Text>
        </View>

        <View style={styles.fila}>
          <Text style={styles.etiqueta}>Disponible hoy</Text>
          <Text style={[
            styles.valor,
            { color: usuario?.disponibleHoy ? '#059669' : '#DC2626' }
          ]}>
            {usuario?.disponibleHoy ? '✅ Sí' : '❌ No'}
          </Text>
        </View>
      </View>

      {/* Organización */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Organización</Text>

        <View style={styles.fila}>
          <Text style={styles.etiqueta}>Departamento</Text>
          <Text style={styles.valor}>{usuario?.departamento}</Text>
        </View>

        <View style={styles.fila}>
          <Text style={styles.etiqueta}>Superintendencia</Text>
          <Text style={styles.valor}>{usuario?.superintendencia}</Text>
        </View>

        <View style={styles.fila}>
          <Text style={styles.etiqueta}>UAS</Text>
          <Text style={styles.valor}>{usuario?.uas}</Text>
        </View>
      </View>

      {/* Botón cerrar sesión */}
      <View style={styles.seccionBoton}>
        <TouchableOpacity
          style={[styles.botonCerrarSesion, cerrandoSesion && styles.botonDeshabilitado]}
          onPress={handleLogout}
          disabled={cerrandoSesion}
        >
          {cerrandoSesion ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.botonCerrarSesionTexto}>🚪 Cerrar Sesión</Text>
          )}
        </TouchableOpacity>
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
    paddingBottom: 32,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarTexto: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  nombre: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cargo: {
    fontSize: 14,
    color: '#BFDBFE',
  },
  seccion: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
    padding: 16,
  },
  seccionTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  etiqueta: {
    fontSize: 14,
    color: '#6B7280',
  },
  valor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  seccionBoton: {
    margin: 16,
    marginTop: 24,
    marginBottom: 40,
  },
  botonCerrarSesion: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  botonCerrarSesionTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PerfilScreen;
