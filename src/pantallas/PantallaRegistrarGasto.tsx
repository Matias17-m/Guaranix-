import React, { useCallback, useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { usarAlmacenGastos } from '@/almacen/usarAlmacenGastos';
import { coloresTema, usarTema } from '@/almacen/usarTema';
import { traducir } from '@/utilidades/traducciones';
import { convertirISOaFechaLocal, obtenerFechaHoyISO, obtenerFechaISO } from '@/utilidades/formato';

export default function PantallaRegistrarGasto({ navigation }: any) {
  const { categorias, cargarCategorias, agregarGasto } = usarAlmacenGastos();
  const modo = usarTema((estado) => estado.modo);
  const idioma = usarTema((estado) => estado.idioma);
  const colores = coloresTema[modo];
  const t = (clave: Parameters<typeof traducir>[1]) => traducir(idioma, clave);
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [fechaGasto, setFechaGasto] = useState(obtenerFechaHoyISO());
  const [fechaTemporal, setFechaTemporal] = useState(convertirISOaFechaLocal(obtenerFechaHoyISO()));
  const [selectorFechaVisible, setSelectorFechaVisible] = useState(false);

  useEffect(() => {
    cargarCategorias();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const hoy = obtenerFechaHoyISO();
      setFechaGasto(hoy);
      setFechaTemporal(convertirISOaFechaLocal(hoy));
    }, []),
  );

  async function guardarGasto() {
    if (!monto || !categoriaSeleccionada) return;

    await agregarGasto({
      categoriaId: categoriaSeleccionada,
      descripcion,
      monto: Number(monto),
      moneda: 'PYG',
      fecha: fechaGasto,
    });

    setMonto('');
    setDescripcion('');
    setCategoriaSeleccionada(null);
    navigation.navigate('Inicio');
  }

  function abrirSelectorFecha() {
    setFechaTemporal(convertirISOaFechaLocal(fechaGasto));
    setSelectorFechaVisible(true);
  }

  function cambiarFecha(evento: DateTimePickerEvent, fecha?: Date) {
    if (evento.type === 'dismissed' || !fecha) return;
    setFechaTemporal(fecha);
  }

  function confirmarFecha() {
    setFechaGasto(obtenerFechaISO(fechaTemporal));
    setSelectorFechaVisible(false);
  }

  return (
    <SafeAreaView style={[estilos.contenedor, { backgroundColor: colores.fondo }]} edges={['top']}>
      <Text style={[estilos.titulo, { color: colores.texto }]}>{t('agregarGasto')}</Text>
      <TouchableOpacity style={[estilos.selectorFecha, { borderColor: colores.borde, backgroundColor: colores.superficie }]} onPress={abrirSelectorFecha}>
        <MaterialCommunityIcons name="calendar" size={18} color="#E0B84B" />
        <Text style={estilos.fechaSeleccionada}>
          {t('fechaGasto')}: {convertirISOaFechaLocal(fechaGasto).toLocaleDateString(idioma === 'es' ? 'es-PY' : 'en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          })}
        </Text>
      </TouchableOpacity>

      <Modal visible={selectorFechaVisible} transparent animationType="fade" onRequestClose={() => setSelectorFechaVisible(false)}>
        <View style={[estilos.fondoModal, { backgroundColor: colores.fondoModal }]}> 
          <View style={[estilos.contenidoModal, { backgroundColor: colores.modal }]}> 
            <Text style={[estilos.tituloModal, { color: colores.texto }]}>{t('fechaGasto')}</Text>
            <DateTimePicker
              value={fechaTemporal}
              mode="date"
              display="spinner"
              onChange={cambiarFecha}
              themeVariant={modo === 'oscuro' ? 'dark' : 'light'}
            />
            <View style={estilos.filaBotonesModal}>
              <TouchableOpacity style={estilos.botonCancelar} onPress={() => setSelectorFechaVisible(false)}>
                <Text style={[estilos.textoCancelar, { color: colores.textoSecundario }]}>{t('cancelar')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.botonConfirmar} onPress={confirmarFecha}>
                <Text style={estilos.textoConfirmar}>{t('elegir')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={[estilos.etiquetaMonto, { color: colores.textoSecundario }]}>{t('monto')}</Text>
      <TextInput
        style={[estilos.montoInput, { color: colores.textoCampo, borderColor: colores.borde, backgroundColor: colores.campo }]}
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
        style={[estilos.textoInput, { color: colores.textoCampo, borderColor: colores.borde, backgroundColor: colores.campo }]}
        placeholder={t('descripcionOpcional')}
        placeholderTextColor="#7A7A7A"
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TouchableOpacity style={estilos.botonGuardar} onPress={guardarGasto}>
        <Text style={estilos.textoBotonGuardar}>{t('guardarGasto')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#101010', padding: 16 },
  titulo: { fontSize: 15, fontWeight: '500', color: '#FFFFFF', marginBottom: 16 },
  selectorFecha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  fechaSeleccionada: { flex: 1, fontSize: 13, color: '#E0B84B' },
  fondoModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  contenidoModal: {
    width: '90%',
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  tituloModal: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
  filaBotonesModal: { flexDirection: 'row', gap: 12, marginTop: 12 },
  botonCancelar: { padding: 10 },
  textoCancelar: { color: '#B0B0B0' },
  botonConfirmar: { backgroundColor: '#E0B84B', borderRadius: 6, padding: 10 },
  textoConfirmar: { color: '#101010', fontWeight: '600' },
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
