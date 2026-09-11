import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usarAlmacenGastos } from '@/almacen/usarAlmacenGastos';
import { coloresTema, usarTema } from '@/almacen/usarTema';
import { traducir } from '@/utilidades/traducciones';
import { guardarPresupuestoRemoto, obtenerPresupuestosRemotos } from '@/bd/presupuestosRemotos';
import {
  formatearGuaranies,
  convertirISOaFechaLocal,
  obtenerMesDeFechaISO,
  obtenerSemanaISO,
} from '@/utilidades/formato';

const COLORES_CATEGORIA = ['#E0B84B', '#5DA9E9', '#C084FC', '#5CC8A1', '#E57A6D', '#F59E7A'];

export default function PantallaPresupuesto() {
  const { categorias, gastosDelMes, fechaSeleccionada, cargarCategorias, cargarGastosDelMes, crearCategoria, borrarCategoria } = usarAlmacenGastos();
  const modo = usarTema((estado) => estado.modo);
  const idioma = usarTema((estado) => estado.idioma);
  const colores = coloresTema[modo];
  const t = (clave: Parameters<typeof traducir>[1]) => traducir(idioma, clave);
  const [periodo, setPeriodo] = useState<'mensual' | 'semanal' | 'diario'>('mensual');
  const [modalVisible, setModalVisible] = useState(false);
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [montoLimite, setMontoLimite] = useState('');
  const [montoGeneral, setMontoGeneral] = useState('');
  const [montosPorCategoria, setMontosPorCategoria] = useState<Record<number, string>>({});

  useEffect(() => {
    cargarCategorias();
    cargarGastosDelMes();
    void cargarMontosGuardados();
  }, [periodo]);

  async function cargarMontosGuardados() {
    const mesOSemana = obtenerClavePeriodo();
    const presupuestos = await obtenerPresupuestosRemotos(mesOSemana);
    const mapa: Record<number, string> = {};
    presupuestos.forEach((p) => {
      if (p.categoriaId !== null) mapa[p.categoriaId] = String(p.montoLimite);
      if (p.categoriaId === null) setMontoGeneral(String(p.montoLimite));
    });
    setMontosPorCategoria(mapa);
  }

  function obtenerClavePeriodo() {
    if (periodo === 'mensual') return obtenerMesDeFechaISO(fechaSeleccionada);
    if (periodo === 'semanal') return obtenerSemanaISO(convertirISOaFechaLocal(fechaSeleccionada));
    return fechaSeleccionada;
  }

  function crearNuevaCategoria() {
    if (!nombreCategoria) return;
    const color = COLORES_CATEGORIA[categorias.length % COLORES_CATEGORIA.length];
    crearCategoria(nombreCategoria, 'shape-outline', color);
    setNombreCategoria('');
    setMontoLimite('');
    setModalVisible(false);
    cargarCategorias();
  }

  async function guardarTodoElPresupuesto() {
    Keyboard.dismiss();
    const mesOSemana = obtenerClavePeriodo();
    await guardarPresupuestoRemoto(null, Number(montoGeneral || 0), periodo, mesOSemana);
    await Promise.all(categorias.map((categoria) => {
      const monto = Number(montosPorCategoria[categoria.id] ?? 0);
      return guardarPresupuestoRemoto(categoria.id, monto, periodo, mesOSemana);
    }));
    Alert.alert(t('listo'), t('presupuestoGuardado'));
  }

  function confirmarBorradoCategoria(id: number, nombre: string) {
    Alert.alert(
      'Eliminar categoría',
      `Se eliminarán también sus gastos y presupuestos. ¿Eliminar ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => borrarCategoria(id) },
      ],
    );
  }

  return (
    <SafeAreaView style={[estilos.contenedor, { backgroundColor: colores.fondo }]} edges={['top']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={estilos.teclado}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={[estilos.titulo, { color: colores.texto }]}>{t('presupuesto')}</Text>
            <Text style={[estilos.fechaPresupuesto, { color: colores.textoSecundario }]}>{t('configurandoPara')} {convertirISOaFechaLocal(fechaSeleccionada).toLocaleDateString(idioma === 'es' ? 'es-PY' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>

      <View style={estilos.filaTabs}>
        <TouchableOpacity
          style={[estilos.tab, { backgroundColor: colores.superficie }, periodo === 'mensual' && estilos.tabActivo]}
          onPress={() => setPeriodo('mensual')}
        >
          <Text style={[estilos.textoTab, { color: colores.texto }]}>{t('mensual')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[estilos.tab, { backgroundColor: colores.superficie }, periodo === 'semanal' && estilos.tabActivo]}
          onPress={() => setPeriodo('semanal')}
        >
          <Text style={[estilos.textoTab, { color: colores.texto }]}>{t('semanal')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[estilos.tab, { backgroundColor: colores.superficie }, periodo === 'diario' && estilos.tabActivo]}
          onPress={() => setPeriodo('diario')}
        >
          <Text style={[estilos.textoTab, { color: colores.texto }]}>{t('diario')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[estilos.filaPresupuestoGeneral, { backgroundColor: colores.superficie }]}>
        <Text style={[estilos.etiquetaGeneral, { color: colores.texto }]}>{t('presupuestoGeneral')} {periodo === 'mensual' ? t('mensual').toLowerCase() : periodo === 'semanal' ? t('semanal').toLowerCase() : t('diario').toLowerCase()}</Text>
        <View style={estilos.filaMontoEditable}>
          <Text style={estilos.simboloGuarani}>₲</Text>
          <TextInput
            style={estilos.inputMontoCategoria}
            placeholder="0"
            placeholderTextColor="#7A7A7A"
            keyboardType="numeric"
            value={montoGeneral}
            onChangeText={setMontoGeneral}
          />
        </View>
      </View>

      {categorias.map((categoria) => (
        <View key={categoria.id} style={estilos.bloqueCategoria}>
          <View style={estilos.filaCategoria}>
            <View style={estilos.filaEtiqueta}>
              <MaterialCommunityIcons name={categoria.icono as any} size={14} color={categoria.color} />
                <Text style={[estilos.nombreCategoria, { color: colores.texto }]}>{categoria.nombre}</Text>
            </View>
            <View style={estilos.filaAccionesCategoria}>
              <View style={estilos.filaMontoEditable}>
                <Text style={[estilos.simboloGuarani, { color: colores.textoSecundario }]}>₲</Text>
                <TextInput
                  style={[estilos.inputMontoCategoria, { color: colores.textoCampo }]}
                  placeholder="0"
                  placeholderTextColor="#7A7A7A"
                  keyboardType="numeric"
                  value={montosPorCategoria[categoria.id] ?? ''}
                  onChangeText={(texto) =>
                    setMontosPorCategoria((previo) => ({ ...previo, [categoria.id]: texto }))
                  }
                />
              </View>
              <TouchableOpacity
                style={estilos.botonEliminar}
                onPress={() => confirmarBorradoCategoria(categoria.id, categoria.nombre)}
                accessibilityLabel={`Eliminar categoría ${categoria.nombre}`}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#E24B4A" />
              </TouchableOpacity>
            </View>
          </View>

        </View>
      ))}

      <TouchableOpacity style={estilos.botonSecundario} onPress={() => setModalVisible(true)}>
        <Text style={[estilos.textoBotonSecundario, { color: colores.texto }]}>{t('anadirCategoria')}</Text>
      </TouchableOpacity>

            <TouchableOpacity style={estilos.botonGuardar} onPress={guardarTodoElPresupuesto}>
              <Text style={estilos.textoBotonGuardar}>{t('guardarPresupuesto')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={[estilos.fondoModal, { backgroundColor: colores.fondoModal }]}> 
          <View style={[estilos.contenidoModal, { backgroundColor: colores.modal }]}> 
            <Text style={[estilos.tituloModal, { color: colores.texto }]}>{t('nuevaCategoria')}</Text>

            <TextInput
              style={[estilos.textoInput, { color: colores.textoCampo, borderColor: colores.borde, backgroundColor: colores.campo }]}
              placeholder="Ej. Salud"
              placeholderTextColor="#7A7A7A"
              value={nombreCategoria}
              onChangeText={setNombreCategoria}
            />
            <TextInput
              style={[estilos.textoInput, { color: colores.textoCampo, borderColor: colores.borde, backgroundColor: colores.campo }]}
              placeholder="₲ 0"
              placeholderTextColor="#7A7A7A"
              keyboardType="numeric"
              value={montoLimite}
              onChangeText={setMontoLimite}
            />

            <View style={estilos.filaBotonesModal}>
              <TouchableOpacity
                style={estilos.botonCancelar}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[estilos.textoBotonSecundario, { color: colores.texto }]}>{t('cancelar')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.botonCrear} onPress={crearNuevaCategoria}>
                <Text style={estilos.textoBotonGuardar}>{t('crear')}</Text>
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
  teclado: { flex: 1 },
  titulo: { fontSize: 15, fontWeight: '500', color: '#FFFFFF', marginBottom: 12 },
  fechaPresupuesto: { fontSize: 12, marginBottom: 12 },
  filaTabs: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  tab: { flex: 1, padding: 8, borderRadius: 8, alignItems: 'center', backgroundColor: '#1A1A1A' },
  tabActivo: { backgroundColor: '#E0B84B' },
  textoTab: { fontSize: 12, color: '#FFFFFF' },
  filaPresupuestoGeneral: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  etiquetaGeneral: { flex: 1, fontSize: 13, color: '#FFFFFF' },
  filaCategoria: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  bloqueCategoria: { marginBottom: 8 },
  filaEtiqueta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nombreCategoria: { fontSize: 13, color: '#FFFFFF' },
  montoCategoria: { fontSize: 12, color: '#B0B0B0' },
  filaMontoEditable: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  simboloGuarani: { fontSize: 12, color: '#B0B0B0', marginRight: 4 },
  inputMontoCategoria: { fontSize: 12, color: '#FFFFFF', minWidth: 70, paddingVertical: 6 },
  filaAccionesCategoria: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  botonEliminar: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  botonSecundario: {
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  textoBotonSecundario: { fontSize: 13, color: '#FFFFFF' },
  botonGuardar: { backgroundColor: '#E0B84B', borderRadius: 8, padding: 12, alignItems: 'center' },
  textoBotonGuardar: { fontSize: 14, fontWeight: '500', color: '#101010' },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenidoModal: { width: '80%', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 18 },
  tituloModal: { fontSize: 14, fontWeight: '500', color: '#FFFFFF', marginBottom: 14 },
  textoInput: {
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    padding: 10,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  filaBotonesModal: { flexDirection: 'row', gap: 8, marginTop: 4 },
  botonCancelar: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  botonCrear: { flex: 1, backgroundColor: '#E0B84B', borderRadius: 8, padding: 10, alignItems: 'center' },
});
