import React from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { coloresTema, usarTema } from '@/almacen/usarTema';

export function EstadoRemoto({ cargando, error }: { cargando: boolean; error: string | null }) {
  const modo = usarTema((estado) => estado.modo);
  const colores = coloresTema[modo];

  if (!cargando && !error) return null;

  return (
    <View style={[estilos.contenedor, { backgroundColor: colores.superficie, borderColor: error ? '#E24B4A' : colores.borde }]}>
      {cargando && <ActivityIndicator size="small" color="#E0B84B" />}
      <Text style={[estilos.texto, { color: error ? '#E24B4A' : colores.textoSecundario }]}>
        {error ?? 'Cargando datos...'}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 0.5, borderRadius: 8, padding: 10, marginBottom: 10 },
  texto: { flex: 1, fontSize: 12 },
});
