import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NavegacionPrincipal from '@/navegacion/NavegacionPrincipal';
import { inicializarBaseDeDatos } from '@/bd/basededatos';

export default function App() {
  useEffect(() => {
    inicializarBaseDeDatos();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavegacionPrincipal />
    </SafeAreaProvider>
  );
}
