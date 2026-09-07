import React, { useEffect, useState } from 'react';
import { Alert, Modal, View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { usarAlmacenGastos } from '@/almacen/usarAlmacenGastos';
import { convertirISOaFechaLocal, formatearGuaranies, obtenerFechaISO } from '@/utilidades/formato';

export default function PantallaGastos() {
  const {
    categorias,
    gastosDelMes,
    cargarCategorias,
    cargarGastosDelMes,
    borrarGasto,
  } = usarAlmacenGastos();
  const [busqueda, setBusqueda] = useState('');
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [montoMinimo, setMontoMinimo] = useState('');
  const [montoMaximo, setMontoMaximo] = useState('');
  const [orden, setOrden] = useState<'fecha' | 'monto'>('fecha');
  const [selectorFecha, setSelectorFecha] = useState<'desde' | 'hasta' | null>(null);
  const [fechaTemporal, setFechaTemporal] = useState(new Date());

  useEffect(() => {
    cargarCategorias();
    cargarGastosDelMes();
  }, []);

  function obtenerCategoria(categoriaId: number) {
    return categorias.find((categoria) => categoria.id === categoriaId);
  }

  function confirmarEliminacion(id: number, descripcion: string) {
    Alert.alert(
      'Eliminar gasto',
      `¿Quieres eliminar ${descripcion || 'este gasto'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => borrarGasto(id) },
      ],
    );
  }

  const gastosFiltrados = gastosDelMes
    .filter((gasto) => {
      const coincideBusqueda = (gasto.descripcion || '').toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = categoriaSeleccionada === null || gasto.categoriaId === categoriaSeleccionada;
      const coincideDesde = !fechaDesde || gasto.fecha >= fechaDesde;
      const coincideHasta = !fechaHasta || gasto.fecha <= fechaHasta;
      const minimo = montoMinimo ? Number(montoMinimo) : 0;
      const maximo = montoMaximo ? Number(montoMaximo) : Number.POSITIVE_INFINITY;
      return coincideBusqueda && coincideCategoria && coincideDesde && coincideHasta
        && gasto.monto >= minimo && gasto.monto <= maximo;
    })
    .sort((a, b) => orden === 'fecha' ? b.fecha.localeCompare(a.fecha) : b.monto - a.monto);

  function limpiarFiltros() {
    setCategoriaSeleccionada(null);
    setFechaDesde('');
    setFechaHasta('');
    setMontoMinimo('');
    setMontoMaximo('');
    setBusqueda('');
  }

  function abrirSelectorFecha(tipo: 'desde' | 'hasta') {
    const fechaGuardada = tipo === 'desde' ? fechaDesde : fechaHasta;
    setFechaTemporal(fechaGuardada ? convertirISOaFechaLocal(fechaGuardada) : new Date());
    setSelectorFecha(tipo);
  }

  function cambiarFecha(evento: DateTimePickerEvent, fecha?: Date) {
    if (evento.type === 'dismissed' || !fecha) return;
    setFechaTemporal(fecha);
  }

  function confirmarFecha() {
    if (selectorFecha === 'desde') setFechaDesde(obtenerFechaISO(fechaTemporal));
    if (selectorFecha === 'hasta') setFechaHasta(obtenerFechaISO(fechaTemporal));
    setSelectorFecha(null);
  }

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top']}>
      <Text style={estilos.titulo}>Gastos</Text>

      <TextInput
        style={estilos.buscador}
        placeholder="Buscar gasto..."
        placeholderTextColor="#7A7A7A"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <TouchableOpacity
        style={estilos.botonFiltros}
        onPress={() => setFiltrosVisibles((visible) => !visible)}
        accessibilityLabel="Mostrar filtros"
      >
        <MaterialCommunityIcons name="filter-variant" size={18} color="#E0B84B" />
        <Text style={estilos.textoBotonFiltros}>Filtros</Text>
      </TouchableOpacity>

      {filtrosVisibles && (
        <View style={estilos.panelFiltros}>
          <Text style={estilos.etiquetaFiltro}>Categoría</Text>
          <View style={estilos.filaCategorias}>
            <TouchableOpacity
              style={[estilos.chip, categoriaSeleccionada === null && estilos.chipActivo]}
              onPress={() => setCategoriaSeleccionada(null)}
            >
              <Text style={estilos.textoChip}>Todas</Text>
            </TouchableOpacity>
            {categorias.map((categoria) => (
              <TouchableOpacity
                key={categoria.id}
                style={[estilos.chip, categoriaSeleccionada === categoria.id && estilos.chipActivo]}
                onPress={() => setCategoriaSeleccionada(categoria.id)}
              >
                <View style={[estilos.puntoCategoria, { backgroundColor: categoria.color }]} />
                <Text style={estilos.textoChip}>{categoria.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={estilos.etiquetaFiltro}>Rango de fechas</Text>
          <View style={estilos.filaInputs}>
            <TouchableOpacity style={estilos.selectorFecha} onPress={() => abrirSelectorFecha('desde')}>
              <MaterialCommunityIcons name="calendar-start" size={16} color="#E0B84B" />
              <Text style={estilos.textoSelectorFecha}>{fechaDesde || 'Desde'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={estilos.selectorFecha} onPress={() => abrirSelectorFecha('hasta')}>
              <MaterialCommunityIcons name="calendar-end" size={16} color="#E0B84B" />
              <Text style={estilos.textoSelectorFecha}>{fechaHasta || 'Hasta'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={estilos.etiquetaFiltro}>Monto</Text>
          <View style={estilos.filaInputs}>
            <TextInput
              style={estilos.inputFiltro}
              placeholder="Mínimo"
              placeholderTextColor="#7A7A7A"
              keyboardType="numeric"
              value={montoMinimo}
              onChangeText={setMontoMinimo}
            />
            <TextInput
              style={estilos.inputFiltro}
              placeholder="Máximo"
              placeholderTextColor="#7A7A7A"
              keyboardType="numeric"
              value={montoMaximo}
              onChangeText={setMontoMaximo}
            />
          </View>

          <View style={estilos.filaOrdenar}>
            <Text style={estilos.etiquetaFiltro}>Ordenar por</Text>
            <TouchableOpacity
              style={[estilos.chip, orden === 'fecha' && estilos.chipActivo]}
              onPress={() => setOrden('fecha')}
            >
              <Text style={estilos.textoChip}>Fecha</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[estilos.chip, orden === 'monto' && estilos.chipActivo]}
              onPress={() => setOrden('monto')}
            >
              <Text style={estilos.textoChip}>Monto</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={limpiarFiltros} style={estilos.botonLimpiar}>
              <Text style={estilos.textoLimpiar}>Limpiar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={selectorFecha !== null} transparent animationType="fade" onRequestClose={() => setSelectorFecha(null)}>
        <View style={estilos.fondoModal}>
          <View style={estilos.contenidoModal}>
            <Text style={estilos.tituloModal}>Elegir fecha</Text>
            <DateTimePicker
              value={fechaTemporal}
              mode="date"
              display="spinner"
              onChange={cambiarFecha}
              themeVariant="dark"
            />
            <View style={estilos.filaBotonesModal}>
              <TouchableOpacity style={estilos.botonCancelar} onPress={() => setSelectorFecha(null)}>
                <Text style={estilos.textoCancelar}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.botonConfirmar} onPress={confirmarFecha}>
                <Text style={estilos.textoConfirmar}>Elegir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={gastosFiltrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const categoria = obtenerCategoria(item.categoriaId);
          return (
            <View style={estilos.filaGasto}>
              <View style={estilos.circuloIcono}>
                <MaterialCommunityIcons
                  name={(categoria?.icono as any) ?? 'dots-horizontal'}
                  size={14}
                  color={categoria?.color ?? '#FFFFFF'}
                />
              </View>
              <View style={estilos.infoGasto}>
                <Text style={estilos.descripcionGasto}>
                  {item.descripcion || categoria?.nombre || 'Gasto'}
                </Text>
                <Text style={estilos.fechaGasto}>{item.fecha}</Text>
              </View>
              <Text style={estilos.montoNegativo}>-{formatearGuaranies(item.monto)}</Text>
              <TouchableOpacity
                style={estilos.botonEliminar}
                onPress={() => confirmarEliminacion(item.id, item.descripcion)}
                accessibilityLabel="Eliminar gasto"
              >
                <MaterialCommunityIcons name="trash-can-outline" size={19} color="#E24B4A" />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#101010', padding: 16 },
  titulo: { fontSize: 15, fontWeight: '500', color: '#FFFFFF', marginBottom: 10 },
  buscador: {
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    padding: 10,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  botonFiltros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  textoBotonFiltros: { fontSize: 13, color: '#E0B84B' },
  panelFiltros: { backgroundColor: '#1A1A1A', borderRadius: 8, padding: 10, marginBottom: 8 },
  etiquetaFiltro: { fontSize: 11, color: '#9E9E9E', marginBottom: 6, marginTop: 4 },
  filaCategorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 0.5,
    borderColor: '#3A3A3A',
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  chipActivo: { backgroundColor: '#3A321D', borderColor: '#E0B84B' },
  textoChip: { fontSize: 11, color: '#FFFFFF' },
  puntoCategoria: { width: 7, height: 7, borderRadius: 4 },
  filaInputs: { flexDirection: 'row', gap: 8 },
  inputFiltro: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#3A3A3A',
    borderRadius: 6,
    padding: 8,
    color: '#FFFFFF',
    fontSize: 12,
  },
  selectorFecha: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 0.5,
    borderColor: '#3A3A3A',
    borderRadius: 6,
    padding: 9,
  },
  textoSelectorFecha: { color: '#FFFFFF', fontSize: 12 },
  filaOrdenar: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  botonLimpiar: { marginLeft: 'auto', padding: 6 },
  textoLimpiar: { fontSize: 11, color: '#E24B4A' },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenidoModal: { width: '88%', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16 },
  tituloModal: { color: '#FFFFFF', fontSize: 14, marginBottom: 8 },
  filaBotonesModal: { flexDirection: 'row', gap: 8, marginTop: 8 },
  botonCancelar: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#3A3A3A',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  botonConfirmar: { flex: 1, backgroundColor: '#E0B84B', borderRadius: 8, padding: 10, alignItems: 'center' },
  textoCancelar: { color: '#FFFFFF', fontSize: 13 },
  textoConfirmar: { color: '#101010', fontSize: 13, fontWeight: '600' },
  filaGasto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#2A2A2A',
  },
  circuloIcono: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoGasto: { flex: 1 },
  descripcionGasto: { fontSize: 13, color: '#FFFFFF' },
  fechaGasto: { fontSize: 10, color: '#7A7A7A' },
  montoNegativo: { fontSize: 13, color: '#E24B4A' },
  botonEliminar: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});
