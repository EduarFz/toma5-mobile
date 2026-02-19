import React, { useState } from 'react';
import Constants from 'expo-constants';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const { login, sesionCerradaForzado } = useAuth();
  const [cedula, setCedula] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
  console.log('[DEBUG LOGIN] Botón presionado, cédula:', cedula, 'pass:', contrasena ? 'TIENE' : 'VACÍA');
  
  if (!cedula.trim()) {
    setError('Ingresa tu número de cédula.');
    return;
  }
  if (!contrasena.trim()) {
    setError('Ingresa tu contraseña.');
    return;
  }

  try {
    setCargando(true);
    setError('');
    console.log('[DEBUG LOGIN] Llamando a login...');
    await login(cedula.trim(), contrasena.trim());
    console.log('[DEBUG LOGIN] Login exitoso');
  } catch (err) {
  console.log('[DEBUG LOGIN] Error capturado:', err.response?.status, err.message);
  console.log('[DEBUG LOGIN] Respuesta del backend:', JSON.stringify(err.response?.data));
  console.log('[DEBUG LOGIN] Cédula enviada:', cedula.trim());
  if (err.response?.status === 401 && !cedula.trim() && !contrasena.trim()) return;
  const mensaje = err.message || err.response?.data?.mensaje || 'Error al iniciar sesión.';
  setError(mensaje);
}
 finally {
    setCargando(false);
  }
};


  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Aviso de sesión cerrada forzado */}
        {sesionCerradaForzado && !__DEV__ && (
  <View style={styles.avisoCierre}>
    <Text style={styles.avisoCierreTexto}>
      Tu sesión fue cerrada porque iniciaste sesión en otro dispositivo.
    </Text>
  </View>
)}

        {/* Logo / Encabezado */}
        <View style={styles.encabezado}>
          <View style={styles.logoContenedor}>
            <Text style={styles.logoTexto}>T5</Text>
          </View>
          <Text style={styles.titulo}>Sistema Toma 5</Text>
          <Text style={styles.subtitulo}>Cerrejón — Equipos de Vías</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formulario}>
          <Text style={styles.etiqueta}>Cédula</Text>
          <TextInput
            style={styles.input}
            placeholder="Número de cédula"
            placeholderTextColor="#9CA3AF"
            value={cedula}
            onChangeText={setCedula}
            keyboardType="numeric"
            autoCapitalize="none"
            editable={!cargando}
          />

          <Text style={styles.etiqueta}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#9CA3AF"
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry
            editable={!cargando}
          />

          {/* Mensaje de error */}
          {error ? (
            <View style={styles.errorContenedor}>
              <Text style={styles.errorTexto}>{error}</Text>
            </View>
          ) : null}

          {/* Botón de login */}
          <TouchableOpacity
            style={[styles.boton, cargando && styles.botonDeshabilitado]}
            onPress={handleLogin}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.botonTexto}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Pie */}
        <Text style={styles.pie}>App para Trabajadores · v1.0.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  avisoCierre: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  avisoCierreTexto: {
    color: '#92400E',
    fontSize: 14,
    textAlign: 'center',
  },
  encabezado: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContenedor: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoTexto: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 16,
    color: '#6B7280',
  },
  formulario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  errorContenedor: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorTexto: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  boton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  botonDeshabilitado: {
    backgroundColor: '#9CA3AF',
  },
  botonTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pie: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 32,
  },
});

export default LoginScreen;
