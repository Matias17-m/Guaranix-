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
import PantallaAjustes from '@/pantallas/PantallaAjustes';
import { coloresTema, usarTema } from '@/almacen/usarTema';

const Tab = createBottomTabNavigator();

function BotonFlotanteRegistrar({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={estilos.botonFlotante} onPress={onPress}>
      <MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

export default function NavegacionPrincipal() {
  const modo = usarTema((estado) => estado.modo);
  const idioma = usarTema((estado) => estado.idioma);
  const colores = coloresTema[modo];
  const textos = idioma === 'es'
    ? { inicio: 'Inicio', presupuesto: 'Presupuesto', gastos: 'Gastos', resumen: 'Resumen', ajustes: 'Ajustes' }
    : { inicio: 'Home', presupuesto: 'Budget', gastos: 'Expenses', resumen: 'Summary', ajustes: 'Settings' };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#E0B84B',
          tabBarInactiveTintColor: colores.textoSecundario,
          tabBarStyle: {
            backgroundColor: colores.fondo,
            borderTopColor: colores.borde,
            borderTopWidth: 0.5,
          },
        }}
      >
        <Tab.Screen
          name="Inicio"
          component={PantallaInicio}
          options={{ tabBarLabel: textos.inicio,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
        />
        <Tab.Screen
          name="Presupuesto"
          component={PantallaPresupuesto}
          options={{ tabBarLabel: textos.presupuesto,
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
          options={{ tabBarLabel: textos.gastos,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="format-list-bulleted" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Resumen"
          component={PantallaResumen}
          options={{ tabBarLabel: textos.resumen,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="chart-line" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Ajustes"
          component={PantallaAjustes}
          options={{
            tabBarButton: () => null,
            tabBarLabel: textos.ajustes,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog-outline" color={color} size={size} />
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
