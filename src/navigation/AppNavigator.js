import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

const AppNavigator = () => {
  const { estaAutenticado, cargando } = useAuth();
  const navigationRef = useRef(null);

  // Deep link: al tocar una notificación, navegar a la tarea
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const tareaId = response.notification.request.content.data?.tareaId;
        if (tareaId && navigationRef.current?.isReady()) {
          navigationRef.current.navigate('Tareas', {
            screen: 'DetalleTarea',
            params: { tareaId },
          });
        }
      }
    );
    return () => subscription.remove();
  }, []);

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.cargandoTexto}>Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {estaAutenticado ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  cargando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  cargandoTexto: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default AppNavigator;
