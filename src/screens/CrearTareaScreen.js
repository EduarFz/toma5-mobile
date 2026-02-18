import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tareaService from '../services/tareas.service';
import { useAuth } from '../context/AuthContext';

const CrearTareaScreen = () => {
  const navigation = useNavigation();
  const { usuario } = useAuth();
  const [descripcion, setDescripcion] = useState('');
  const [lugar, setLugar] = useState('');
  const [creando, setCreando] = useState(false);

  const handleCrear = async () => {
    if (!descripcion.trim()) {
      Alert.alert('Campo requerido', 'Debes ingresar una descripción para la tarea.');
      return;
    }

    Alert.alert(
      'Crear tarea',
      '¿Confirmas que deseas crear esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Crear',
          onPress: async () => {
            try {
              setCreando(true);

              console.log('trabajadorId que se está enviando:', usuario.trabajadorId);
console.log('usuario completo:', JSON.stringify(usuario));


              await tareaService.crearTarea(descripcion.trim(), lugar.trim(), usuario.trabajadorId);

              Alert.alert(
                '✅ Tarea creada',
                'La tarea fue creada exitosamente. Ya puedes diligenciar el Toma 5.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (err) {
              const mensaje =
                err.response?.data?.mensaje || 'Error al crear la tarea. Intenta de nuevo.';
              Alert.alert('Error', mensaje);
            } finally {
              setCreando(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.contenedor} keyboardShouldPersistTaps="handled">
      {/* Encabezado */}
      <View style={styles.encabezado}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonVolver}>
          <Text style={styles.botonVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.tituloEncabezado}>Nueva Tarea</Text>
      </View>

      <View style={styles.contenido}>
        {/* Aviso */}
        <View style={styles.aviso}>
          <Text style={styles.avisoTexto}>
            💡 Crea una tarea cuando vayas a realizar una actividad que no fue asignada por el supervisor pero que igualmente requiere diligenciar un Toma 5.
          </Text>
        </View>

        {/* Descripción */}
        <View style={styles.campoContenedor}>
          <Text style={styles.etiqueta}>
            Descripción de la tarea <Text style={styles.requerido}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Conducción de equipo liviano para traslado a bodega"
            placeholderTextColor="#9CA3AF"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!creando}
          />
        </View>

        {/* Lugar */}
        <View style={styles.campoContenedor}>
          <Text style={styles.etiqueta}>
            Lugar <Text style={styles.opcional}>(opcional)</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Kilómetro 80, patio de talleres"
            placeholderTextColor="#9CA3AF"
            value={lugar}
            onChangeText={setLugar}
            editable={!creando}
          />
        </View>

        {/* Botón crear */}
        <TouchableOpacity
          style={[styles.botonCrear, creando && styles.botonDeshabilitado]}
          onPress={handleCrear}
          disabled={creando}
        >
          {creando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.botonCrearTexto}>➕ Crear Tarea</Text>
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
  aviso: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  avisoTexto: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  campoContenedor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  requerido: {
    color: '#DC2626',
  },
  opcional: {
    fontWeight: '400',
    color: '#9CA3AF',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 48,
  },
  botonCrear: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  botonCrearTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CrearTareaScreen;
