import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import TareasScreen from '../screens/TareasScreen';
import DetalleTareaScreen from '../screens/DetalleTareaScreen';
import Toma5Screen from '../screens/Toma5Screen';
import CrearTareaScreen from '../screens/CrearTareaScreen';
import PerfilScreen from '../screens/PerfilScreen';


const PlaceholderScreen = ({ nombre }) => (
  <View style={styles.placeholder}>
    <Text style={styles.texto}>{nombre}</Text>
    <Text style={styles.subtexto}>Próximamente</Text>
  </View>
);

const NotificacionesPlaceholder = () => <PlaceholderScreen nombre="🔔 Notificaciones" />;
const HistorialPlaceholder = () => <PlaceholderScreen nombre="📋 Historial" />;
const PerfilPlaceholder = PerfilScreen;

const TareasStack = createNativeStackNavigator();
const TareasNavigator = () => (
  <TareasStack.Navigator screenOptions={{ headerShown: false }}>
    <TareasStack.Screen name="TareasList" component={TareasScreen} />
    <TareasStack.Screen name="DetalleTarea" component={DetalleTareaScreen} />
    <TareasStack.Screen name="Toma5" component={Toma5Screen} />
    <TareasStack.Screen name="CrearTarea" component={CrearTareaScreen} />
  </TareasStack.Navigator>
);

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1E3A8A',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          paddingBottom: 40,
          paddingTop: 8,
          height: 100,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          const iconos = {
            Tareas: '📋',
            Notificaciones: '🔔',
            Historial: '🕐',
            Perfil: '👤',
          };
          return (
            <Text style={{ fontSize: size - 4, color }}>{iconos[route.name]}</Text>
          );
        },
      })}
    >
      <Tab.Screen name="Tareas" component={TareasNavigator} />
      <Tab.Screen name="Notificaciones" component={NotificacionesPlaceholder} />
      <Tab.Screen name="Historial" component={HistorialPlaceholder} />
      <Tab.Screen name="Perfil" component={PerfilPlaceholder} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  texto: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtexto: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
});

export default TabNavigator;
