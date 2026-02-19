import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import NetInfo from '@react-native-community/netinfo';
import asstService from '../services/asst.service';

const AsstScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tareaId } = route.params;

  const [foto1, setFoto1] = useState(null); // { uri, base64 }
  const [foto2, setFoto2] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const elegirFoto = async (numeroFoto) => {
    // Verificar conexión
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      Alert.alert(
        'Sin conexión',
        'Necesitas conexión a internet para subir las fotos del ASST.'
      );
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso requerido',
        'Debes otorgar permiso de cámara para tomar las fotos del ASST.'
      );
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.5,
      base64: true,
    });

    if (resultado.canceled) {
      return;
    }

    const asset = resultado.assets[0];

    const foto = {
      uri: asset.uri,
      base64: `data:image/jpeg;base64,${asset.base64}`,
    };

    if (numeroFoto === 1) {
      setFoto1(foto);
    } else {
      setFoto2(foto);
    }
  };

  const confirmarRepetir = (numeroFoto) => {
    Alert.alert(
      'Repetir foto',
      `¿Quieres repetir la foto ${numeroFoto}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Repetir',
          style: 'destructive',
          onPress: () => elegirFoto(numeroFoto),
        },
      ]
    );
  };

  const enviarAsst = async () => {
    if (!foto1 || !foto2) {
      Alert.alert(
        'Faltan fotos',
        'Debes tomar exactamente 2 fotos para enviar el ASST.'
      );
      return;
    }

    Alert.alert(
      'Enviar ASST',
      'Confirmas que las fotos son claras y muestran los peligros y controles?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            try {
              const state = await NetInfo.fetch();
              if (!state.isConnected) {
                Alert.alert(
                  'Sin conexión',
                  'Necesitas conexión a internet para enviar el ASST.'
                );
                return;
              }

              setSubiendo(true);
              await asstService.subirAsst(
                tareaId,
                foto1.base64,
                foto2.base64
              );

              Alert.alert(
                'ASST enviado',
                'Las fotos del ASST fueron enviadas correctamente. La tarea ahora está lista para iniciar.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (err) {
  console.log('Error al enviar ASST:', JSON.stringify(err.response?.data || err, null, 2));
  const mensaje =
    err.response?.data?.mensaje ||
    err.response?.data?.error ||
    'Error al subir el ASST. Verifica el estado de la tarea o intenta de nuevo.';
  Alert.alert('Error', mensaje);
} finally {

              setSubiendo(false);
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.botonVolver}
        >
          <Text style={styles.botonVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.tituloEncabezado}>ASST - Fotos</Text>
      </View>

      <View style={styles.contenido}>
        {/* Aviso */}
        <View style={styles.aviso}>
          <Text style={styles.avisoTitulo}>📸 Análisis de Seguridad (ASST)</Text>
          <Text style={styles.avisoTexto}>
            Debes tomar exactamente 2 fotos que muestren los peligros y los
            controles implementados antes de iniciar la tarea.
          </Text>
          <Text style={styles.avisoTexto}>
            Una vez enviadas, las fotos no se pueden reemplazar.
          </Text>
        </View>

        {/* Foto 1 */}
        <View style={styles.seccionFoto}>
          <Text style={styles.etiqueta}>Foto 1</Text>

          {foto1 ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: foto1.uri }} style={styles.preview} />
              <View style={styles.botonesFila}>
                <TouchableOpacity
                  style={[styles.botonSecundario, { flex: 1 }]}
                  onPress={() => confirmarRepetir(1)}
                  disabled={subiendo}
                >
                  <Text style={styles.botonSecundarioTexto}>Repetir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.botonTomar}
              onPress={() => elegirFoto(1)}
              disabled={subiendo}
            >
              <Text style={styles.botonTomarTexto}>Tomar Foto 1</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Foto 2 */}
        <View style={styles.seccionFoto}>
          <Text style={styles.etiqueta}>Foto 2</Text>

          {foto2 ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: foto2.uri }} style={styles.preview} />
              <View style={styles.botonesFila}>
                <TouchableOpacity
                  style={[styles.botonSecundario, { flex: 1 }]}
                  onPress={() => confirmarRepetir(2)}
                  disabled={subiendo}
                >
                  <Text style={styles.botonSecundarioTexto}>Repetir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.botonTomar}
              onPress={() => elegirFoto(2)}
              disabled={subiendo}
            >
              <Text style={styles.botonTomarTexto}>Tomar Foto 2</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botón enviar */}
        <TouchableOpacity
          style={[
            styles.botonEnviar,
            (subiendo || !foto1 || !foto2) && styles.botonDeshabilitado,
          ]}
          onPress={enviarAsst}
          disabled={subiendo || !foto1 || !foto2}
        >
          {subiendo ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.botonEnviarTexto}>🚀 Enviar ASST</Text>
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
  avisoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 6,
  },
  avisoTexto: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  seccionFoto: {
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
  botonTomar: {
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonTomarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  previewContainer: {
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#E5E7EB',
  },
  botonesFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  botonSecundario: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
  },
  botonEnviar: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  botonEnviarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AsstScreen;
