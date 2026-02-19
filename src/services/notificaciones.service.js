import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from './api';

// Solo configurar el handler si estamos en dispositivo físico con soporte real
if (Constants.isDevice) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}
export const registrarTokenPush = async () => {
  try {
    // En Expo Go con SDK 53+ las push remotas no funcionan, saltar silenciosamente
    if (!Constants.isDevice) {
      console.log('[Push] Solo funciona en dispositivo físico');
      return null;
    }

    const { status: estadoActual } = await Notifications.getPermissionsAsync();
    let estadoFinal = estadoActual;

    if (estadoActual !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      estadoFinal = status;
    }

    if (estadoFinal !== 'granted') {
      console.log('[Push] Permisos denegados');
      return null;
    }

    // getExpoPushTokenAsync puede fallar en Expo Go SDK 53+, capturarlo
    let token = null;
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      token = tokenData.data;
      console.log('[Push] Token registrado:', token);
    } catch (tokenError) {
      console.log('[Push] No se pudo obtener token (Expo Go no soporta push remotas en SDK 53+):', tokenError.message);
      return null;
    }

    // Guardar en backend solo si se obtuvo el token
    if (token) {
      await api.put('/trabajadores/push-token', { token });

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Toma 5',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1E3A8A',
        });
      }
    }

    return token;
  } catch (error) {
    // No romper la app si las push fallan
    console.log('[Push] Error no crítico al registrar token:', error.message);
    return null;
  }
};
