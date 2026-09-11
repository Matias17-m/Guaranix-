import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NavegacionPrincipal from '@/navegacion/NavegacionPrincipal';
import { usarTema } from '@/almacen/usarTema';
import { usarSesion } from '@/almacen/usarSesion';
import PantallaAutenticacion from '@/pantallas/PantallaAutenticacion';
import PantallaRestablecerContrasena from '@/pantallas/PantallaRestablecerContrasena';

export default function App() {
  const { modo, cargando: temaCargando, inicializar: inicializarTema } = usarTema();
  const { usuario, cargando, recuperandoContrasena, inicializar } = usarSesion();

  useEffect(() => {
    let cancelarEscucha: (() => void) | undefined;
    void inicializarTema();
    inicializar().then((cancelar) => {
      cancelarEscucha = cancelar;
    });
    return () => cancelarEscucha?.();
  }, [inicializar, inicializarTema]);

  if (cargando || temaCargando) {
    return (
      <View style={{ flex: 1, backgroundColor: modo === 'oscuro' ? '#101010' : '#F4F1EA', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#E0B84B" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={modo === 'oscuro' ? 'light' : 'dark'} />
      {recuperandoContrasena
        ? <PantallaRestablecerContrasena />
        : usuario ? <NavegacionPrincipal key={usuario.id} /> : <PantallaAutenticacion />}
    </SafeAreaProvider>
  );
}
