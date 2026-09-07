import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, StyleSheet } from 'react-native';

import PantallaInicio from '@/pantallas/PantallaInicio';
import PantallaPresupuesto from '@/pantallas/PantallaPresupuesto';
import PantallaGastos from '@/pantallas/PantallaGastos';
import PantallaResumen from '@/pantallas/PantallaResumen';
import PantallaRegistrarGasto from '@/pantallas/PantallaRegistrarGasto';

const Tab = createBottomTabNavigator();

function BotonFlotanteRegistrar({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={estilos.botonFlotante} onPress={onPress}>
      <MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

export default function NavegacionPrincipal() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#E0B84B',
          tabBarInactiveTintColor: '#7A7A7A',
          tabBarStyle: {
            backgroundColor: '#101010',
            borderTopColor: '#2A2A2A',
            borderTopWidth: 0.5,
          },
        }}
      >
        <Tab.Screen
          name="Inicio"
          component={PantallaInicio}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Presupuesto"
          component={PantallaPresupuesto}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="wallet" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="RegistrarGasto"
          component={PantallaRegistrarGasto}
          options={({ navigation }) => ({
            tabBarButton: () => (
              <BotonFlotanteRegistrar onPress={() => navigation.navigate('RegistrarGasto')} />
            ),
          })}
        />
        <Tab.Screen
          name="Gastos"
          component={PantallaGastos}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="format-list-bulleted" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Resumen"
          component={PantallaResumen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="chart-line" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const estilos = StyleSheet.create({
  botonFlotante: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1B2A4A',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: -20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
