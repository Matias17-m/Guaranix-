import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usarAlmacenGastos } from '@/almacen/usarAlmacenGastos';
import { obtenerFechaHoyISO } from '@/utilidades/formato';

export default function PantallaRegistrarGasto({ navigation }: any) {
  const { categorias, cargarCategorias, agregarGasto } = usarAlmacenGastos();
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);

  useEffect(() => {
    cargarCategorias();
  }, []);

  function guardarGasto() {
    if (!monto || !categoriaSeleccionada) return;

    agregarGasto({
      categoriaId: categoriaSeleccionada,
      descripcion,
      monto: Number(monto),
      moneda: 'PYG',
      fecha: obtenerFechaHoyISO(),
    });

    setMonto('');
    setDescripcion('');
    setCategoriaSeleccionada(null);
    navigation.navigate('Inicio');
  }

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top']}>
      <Text style={estilos.titulo}>Agregar gasto</Text>

      <Text style={estilos.etiquetaMonto}>Monto</Text>
      <TextInput
        style={estilos.montoInput}
        placeholder="₲ 0"
        placeholderTextColor="#7A7A7A"
        keyboardType="numeric"
        value={monto}
        onChangeText={setMonto}
      />

      <View style={estilos.filaCategorias}>
        {categorias.map((categoria) => (
          <TouchableOpacity
            key={categoria.id}
            style={estilos.itemCategoria}
            onPress={() => setCategoriaSeleccionada(categoria.id)}
          >
            <View
              style={[
                estilos.circuloIcono,
                categoriaSeleccionada === categoria.id && estilos.circuloIconoSeleccionado,
              ]}
            >
              <MaterialCommunityIcons name={categoria.icono as any} size={18} color="#FFFFFF" />
            </View>
            <Text style={estilos.nombreCategoria}>{categoria.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={estilos.textoInput}
        placeholder="Descripción (opcional)"
        placeholderTextColor="#7A7A7A"
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TouchableOpacity style={estilos.botonGuardar} onPress={guardarGasto}>
        <Text style={estilos.textoBotonGuardar}>Guardar gasto</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#101010', padding: 16 },
  titulo: { fontSize: 15, fontWeight: '500', color: '#FFFFFF', marginBottom: 16 },
  etiquetaMonto: { fontSize: 12, color: '#B0B0B0', textAlign: 'center', marginBottom: 4 },
  montoInput: {
    fontSize: 28,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    paddingVertical: 10,
  },
  filaCategorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  itemCategoria: { alignItems: 'center', width: 60 },
  circuloIcono: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  circuloIconoSeleccionado: { backgroundColor: '#E0B84B' },
  nombreCategoria: { fontSize: 10, color: '#B0B0B0', textAlign: 'center' },
  textoInput: {
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    padding: 10,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  botonGuardar: {
    backgroundColor: '#E0B84B',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  textoBotonGuardar: { fontSize: 14, fontWeight: '500', color: '#101010' },
});
