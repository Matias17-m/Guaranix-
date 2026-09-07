import React, { useEffect, useState } from 'react';
import { Modal, View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usarAlmacenGastos } from '@/almacen/usarAlmacenGastos';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { formatearGuaranies, obtenerFechaISO, convertirISOaFechaLocal } from '@/utilidades/formato';
import { PieChart, BarChart } from 'react-native-gifted-charts';

export default function PantallaResumen() {
  const hoy = new Date();
  const inicioMes = new Date(hoy);
  inicioMes.setDate(inicioMes.getDate() - 30);
  const [fechaDesde, setFechaDesde] = useState(obtenerFechaISO(inicioMes));
  const [fechaHasta, setFechaHasta] = useState(obtenerFechaISO(hoy));
  const [selectorFecha, setSelectorFecha] = useState<'desde' | 'hasta' | null>(null);
  const [fechaTemporal, setFechaTemporal] = useState(hoy);
  const { categorias, gastosDelMes, cargarCategorias, cargarGastosEntreFechas } = usarAlmacenGastos();

  useEffect(() => {
    cargarCategorias();
    cargarGastosEntreFechas(fechaDesde, fechaHasta);
  }, []);

  function abrirSelector(tipo: 'desde' | 'hasta') {
    const valor = tipo === 'desde' ? fechaDesde : fechaHasta;
    setFechaTemporal(convertirISOaFechaLocal(valor));
    setSelectorFecha(tipo);
  }

  function cambiarFecha(evento: DateTimePickerEvent, fecha?: Date) {
    if (evento.type !== 'dismissed' && fecha) setFechaTemporal(fecha);
  }

  function confirmarFecha() {
    const nuevaFecha = obtenerFechaISO(fechaTemporal);
    if (selectorFecha === 'desde') setFechaDesde(nuevaFecha);
    if (selectorFecha === 'hasta') setFechaHasta(nuevaFecha);
    setSelectorFecha(null);
    if (selectorFecha === 'desde') cargarGastosEntreFechas(nuevaFecha, fechaHasta);
    if (selectorFecha === 'hasta') cargarGastosEntreFechas(fechaDesde, nuevaFecha);
  }

  const totalEsteMes = gastosDelMes.reduce((suma, gasto) => suma + gasto.monto, 0);

  const gastosPorCategoria = categorias
    .map((categoria) => ({
      ...categoria,
      total: gastosDelMes
        .filter((gasto) => gasto.categoriaId === categoria.id)
        .reduce((suma, gasto) => suma + gasto.monto, 0),
    }))
    .filter((categoria) => categoria.total > 0);

  const datosTorta = gastosPorCategoria.map((categoria) => ({
    value: categoria.total,
    color: categoria.color,
    text: categoria.nombre,
  }));

  const datosBarras = gastosPorCategoria.map((categoria) => ({
    value: categoria.total,
    label: categoria.nombre.slice(0, 8),
    frontColor: categoria.color,
  }));

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.contenido}>
        <Text style={estilos.titulo}>Resumen</Text>

        <View style={estilos.filaRango}>
          <TouchableOpacity style={estilos.selectorFecha} onPress={() => abrirSelector('desde')}>
            <Text style={estilos.etiquetaRango}>Desde</Text>
            <Text style={estilos.valorRango}>{fechaDesde}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={estilos.selectorFecha} onPress={() => abrirSelector('hasta')}>
            <Text style={estilos.etiquetaRango}>Hasta</Text>
            <Text style={estilos.valorRango}>{fechaHasta}</Text>
          </TouchableOpacity>
        </View>

        <View style={estilos.filaTarjetas}>
          <View style={estilos.tarjeta}>
            <Text style={estilos.etiqueta}>Total del rango</Text>
            <Text style={estilos.monto}>{formatearGuaranies(totalEsteMes)}</Text>
          </View>
        </View>

        {datosTorta.length > 0 && (
          <>
            <Text style={estilos.subtitulo}>Distribución por categoría</Text>
            <View style={estilos.tarjetaGrafico}>
              <PieChart data={datosTorta} donut radius={92} innerRadius={58} showText />
              <View style={estilos.leyenda}>
                {gastosPorCategoria.map((categoria) => (
                  <View key={categoria.id} style={estilos.itemLeyenda}>
                    <View style={[estilos.puntoColor, { backgroundColor: categoria.color }]} />
                    <Text style={estilos.textoLeyenda}>{categoria.nombre}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={estilos.subtitulo}>Gasto por categoría</Text>
            <View style={estilos.tarjetaGrafico}>
              <BarChart
                data={datosBarras}
                height={180}
                barWidth={30}
                spacing={18}
                noOfSections={4}
                yAxisTextStyle={estilos.textoEje}
                xAxisLabelTextStyle={estilos.textoEje}
                hideRules
                isAnimated
              />
            </View>
          </>
        )}
      </ScrollView>
      <Modal visible={selectorFecha !== null} transparent animationType="fade">
        <View style={estilos.fondoModal}>
          <View style={estilos.contenidoModal}>
            <Text style={estilos.tituloModal}>Elegir fecha</Text>
            <DateTimePicker value={fechaTemporal} mode="date" display="spinner" onChange={cambiarFecha} themeVariant="dark" />
            <View style={estilos.filaBotonesModal}>
              <TouchableOpacity style={estilos.botonCancelar} onPress={() => setSelectorFecha(null)}>
                <Text style={estilos.textoModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.botonConfirmar} onPress={confirmarFecha}>
                <Text style={estilos.textoConfirmar}>Elegir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#101010', padding: 16 },
  contenido: { paddingBottom: 24 },
  titulo: { fontSize: 15, fontWeight: '500', color: '#FFFFFF', marginBottom: 14 },
  filaTarjetas: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tarjeta: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 10, padding: 10 },
  etiqueta: { fontSize: 11, color: '#B0B0B0' },
  monto: { fontSize: 16, fontWeight: '500', color: '#FFFFFF', marginTop: 2 },
  filaRango: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  selectorFecha: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 8, padding: 10 },
  etiquetaRango: { fontSize: 10, color: '#9E9E9E' },
  valorRango: { fontSize: 12, color: '#FFFFFF', marginTop: 3 },
  subtitulo: { fontSize: 14, fontWeight: '500', color: '#FFFFFF', marginTop: 8, marginBottom: 8 },
  tarjetaGrafico: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  leyenda: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 8 },
  itemLeyenda: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  puntoColor: { width: 8, height: 8, borderRadius: 4 },
  textoLeyenda: { fontSize: 11, color: '#B0B0B0' },
  textoEje: { color: '#7A7A7A', fontSize: 9 },
  fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  contenidoModal: { width: '88%', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16 },
  tituloModal: { color: '#FFFFFF', fontSize: 14, marginBottom: 8 },
  filaBotonesModal: { flexDirection: 'row', gap: 8, marginTop: 8 },
  botonCancelar: { flex: 1, borderWidth: 0.5, borderColor: '#3A3A3A', borderRadius: 8, padding: 10, alignItems: 'center' },
  botonConfirmar: { flex: 1, backgroundColor: '#E0B84B', borderRadius: 8, padding: 10, alignItems: 'center' },
  textoModal: { color: '#FFFFFF', fontSize: 13 },
  textoConfirmar: { color: '#101010', fontSize: 13, fontWeight: '600' },
});
