import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';

const PerfilScreen = () => {
  const { usuario, logout } = useAuth();

  // Estados existentes
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  // Estados nuevos para cambio de contraseña
  const [mostrarFormContrasena, setMostrarFormContrasena] = useState(false);
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [cambiandoContrasena, setCambiandoContrasena] = useState(false);

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
              console.error('Error al cerrar sesión', error);
            } finally {
              setCerrandoSesion(false);
            }
          },
        },
      ]
    );
  };

  const handleCambiarContrasena = async () => {
    // Validaciones locales
    if (!contrasenaActual.trim()) {
      Alert.alert('Campo requerido', 'Debes ingresar tu contraseña actual.');
      return;
    }
    if (!contrasenaNueva.trim()) {
      Alert.alert('Campo requerido', 'Debes ingresar la nueva contraseña.');
      return;
    }
    if (contrasenaNueva.length < 4) {
      Alert.alert('Contraseña muy corta', 'La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (contrasenaNueva !== confirmarContrasena) {
      Alert.alert('Error', 'La nueva contraseña y la confirmación no coinciden.');
      return;
    }
    if (contrasenaActual === contrasenaNueva) {
      Alert.alert('Error', 'La nueva contraseña debe ser diferente a la actual.');
      return;
    }

    try {
      setCambiandoContrasena(true);
      await authService.cambiarContrasena(contrasenaActual, contrasenaNueva);
      // Limpiar formulario y ocultarlo
      setContrasenaActual('');
      setContrasenaNueva('');
      setConfirmarContrasena('');
      setMostrarFormContrasena(false);
      Alert.alert('¡Éxito!', 'Tu contraseña fue actualizada correctamente.');
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        'No se pudo cambiar la contraseña. Verifica tu conexión.';
      Alert.alert('Error', mensaje);
    } finally {
      setCambiandoContrasena(false);
    }
  };

  const handleToggleFormContrasena = () => {
    // Si se cierra el formulario, limpiar los campos
    if (mostrarFormContrasena) {
      setContrasenaActual('');
      setContrasenaNueva('');
      setConfirmarContrasena('');
    }
    setMostrarFormContrasena(!mostrarFormContrasena);
  };

  return (
    <ScrollView style={styles.contenedor}>

      {/* Encabezado */}
      <View style={styles.encabezado}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>
            {usuario?.nombreCompleto?.charAt(0) ?? '?'}
          </Text>
        </View>
        <Text style={styles.nombre}>{usuario?.nombreCompleto}</Text>
        <Text style={styles.cargo}>{usuario?.cargo ?? 'Técnico Operador'}</Text>
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
        <View style={[styles.fila, styles.filaUltima]}>
          <Text style={styles.etiqueta}>Disponible hoy</Text>
          <Text style={[styles.valor, { color: usuario?.disponibleHoy ? '#059669' : '#DC2626' }]}>
            {usuario?.disponibleHoy ? 'Sí' : 'No'}
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
        <View style={[styles.fila, styles.filaUltima]}>
          <Text style={styles.etiqueta}>UAS</Text>
          <Text style={styles.valor}>{usuario?.uas}</Text>
        </View>
      </View>

      {/* Sección Seguridad - Cambio de contraseña */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Seguridad</Text>

        {/* Botón para mostrar/ocultar el formulario */}
        <TouchableOpacity
          style={styles.botonCambiarContrasena}
          onPress={handleToggleFormContrasena}
          disabled={cambiandoContrasena}
        >
          <Text style={styles.botonCambiarContrasenaTexto}>
            {mostrarFormContrasena ? 'Cancelar' : 'Cambiar Contraseña'}
          </Text>
        </TouchableOpacity>

        {/* Formulario de cambio de contraseña */}
        {mostrarFormContrasena && (
          <View style={styles.formContrasena}>

            <Text style={styles.inputEtiqueta}>Contraseña actual</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña actual"
              placeholderTextColor="#9CA3AF"
              value={contrasenaActual}
              onChangeText={setContrasenaActual}
              secureTextEntry
              editable={!cambiandoContrasena}
            />

            <Text style={styles.inputEtiqueta}>Nueva contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 4 caracteres"
              placeholderTextColor="#9CA3AF"
              value={contrasenaNueva}
              onChangeText={setContrasenaNueva}
              secureTextEntry
              editable={!cambiandoContrasena}
            />

            <Text style={styles.inputEtiqueta}>Confirmar nueva contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Repite la nueva contraseña"
              placeholderTextColor="#9CA3AF"
              value={confirmarContrasena}
              onChangeText={setConfirmarContrasena}
              secureTextEntry
              editable={!cambiandoContrasena}
            />

            <TouchableOpacity
              style={[styles.botonGuardar, cambiandoContrasena && styles.botonDeshabilitado]}
              onPress={handleCambiarContrasena}
              disabled={cambiandoContrasena}
            >
              {cambiandoContrasena ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.botonGuardarTexto}>Guardar nueva contraseña</Text>
              )}
            </TouchableOpacity>

          </View>
        )}
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
            <Text style={styles.botonCerrarSesionTexto}>Cerrar Sesión</Text>
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
  filaUltima: {
    borderBottomWidth: 0,
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
  // Estilos para cambio de contraseña
  botonCambiarContrasena: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonCambiarContrasenaTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  formContrasena: {
    marginTop: 16,
  },
  inputEtiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  botonGuardar: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  botonGuardarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  // Estilos existentes
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
