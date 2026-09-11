import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { coloresTema, usarTema, type Idioma } from '@/almacen/usarTema';
import { usarSesion } from '@/almacen/usarSesion';
import { traducir } from '@/utilidades/traducciones';

const etiquetas = {
  es: {
    titulo: 'Ajustes',
    apariencia: 'Apariencia',
    modoOscuro: 'Modo oscuro',
    modoClaro: 'Modo claro',
    idioma: 'Idioma',
    espanol: 'Español',
    ingles: 'Inglés',
  },
  en: {
    titulo: 'Settings',
    apariencia: 'Appearance',
    modoOscuro: 'Dark mode',
    modoClaro: 'Light mode',
    idioma: 'Language',
    espanol: 'Spanish',
    ingles: 'English',
  },
};

export default function PantallaAjustes() {
  const { modo, idioma, alternarModo, cambiarIdioma } = usarTema();
  const { usuario, cerrarSesion, eliminarCuenta } = usarSesion();
  const colores = coloresTema[modo];
  const textos = etiquetas[idioma];

  function elegirIdioma(nuevoIdioma: Idioma) {
    cambiarIdioma(nuevoIdioma);
  }

  function confirmarEliminacionCuenta() {
    Alert.alert(
      traducir(idioma, 'eliminarCuenta'),
      traducir(idioma, 'confirmarEliminarCuenta'),
      [
        { text: traducir(idioma, 'cancelar'), style: 'cancel' },
        {
          text: traducir(idioma, 'eliminarCuenta'),
          style: 'destructive',
          onPress: async () => {
            const eliminada = await eliminarCuenta();
            if (!eliminada) Alert.alert('Error', usarSesion.getState().error ?? 'No se pudo eliminar la cuenta.');
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={[estilos.contenedor, { backgroundColor: colores.fondo }]} edges={['top']}>
      <Text style={[estilos.titulo, { color: colores.texto }]}>{textos.titulo}</Text>

      <Text style={[estilos.etiquetaSeccion, { color: colores.textoSecundario }]}>{traducir(idioma, 'informacionCuenta')}</Text>
      <View style={[estilos.bloque, { backgroundColor: colores.superficie, borderColor: colores.borde }]}>
        <View style={estilos.datoCuenta}>
          <Text style={[estilos.etiquetaCuenta, { color: colores.textoSecundario }]}>{traducir(idioma, 'nombre')}</Text>
          <Text style={[estilos.valorCuenta, { color: colores.texto }]}>{usuario?.user_metadata?.nombre || '-'}</Text>
        </View>
        <View style={estilos.datoCuenta}>
          <Text style={[estilos.etiquetaCuenta, { color: colores.textoSecundario }]}>{traducir(idioma, 'correo')}</Text>
          <Text style={[estilos.valorCuenta, { color: colores.texto }]}>{usuario?.email || '-'}</Text>
        </View>
        <View style={estilos.datoCuenta}>
          <Text style={[estilos.etiquetaCuenta, { color: colores.textoSecundario }]}>{traducir(idioma, 'identificador')}</Text>
          <Text style={[estilos.valorCuenta, { color: colores.texto }]} numberOfLines={1}>{usuario?.id || '-'}</Text>
        </View>
      </View>

      <Text style={[estilos.etiquetaSeccion, { color: colores.textoSecundario }]}>{textos.apariencia}</Text>
      <View style={[estilos.bloque, { backgroundColor: colores.superficie, borderColor: colores.borde }]}>
        <TouchableOpacity
          style={[estilos.opcion, modo === 'oscuro' && estilos.opcionActiva]}
          onPress={() => modo !== 'oscuro' && alternarModo()}
        >
          <MaterialCommunityIcons name="weather-night" size={20} color="#E0B84B" />
          <Text style={[estilos.textoOpcion, { color: colores.texto }]}>{textos.modoOscuro}</Text>
          {modo === 'oscuro' && <MaterialCommunityIcons name="check" size={20} color="#E0B84B" />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[estilos.opcion, modo === 'claro' && estilos.opcionActiva]}
          onPress={() => modo !== 'claro' && alternarModo()}
        >
          <MaterialCommunityIcons name="weather-sunny" size={20} color="#E0B84B" />
          <Text style={[estilos.textoOpcion, { color: colores.texto }]}>{textos.modoClaro}</Text>
          {modo === 'claro' && <MaterialCommunityIcons name="check" size={20} color="#E0B84B" />}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[estilos.botonCerrar, { borderColor: '#E24B4A' }]} onPress={cerrarSesion}>
        <MaterialCommunityIcons name="logout" size={19} color="#E24B4A" />
        <Text style={estilos.textoCerrar}>{traducir(idioma, 'cerrarSesion')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[estilos.botonEliminar, { borderColor: '#8F3030' }]} onPress={confirmarEliminacionCuenta}>
        <MaterialCommunityIcons name="account-remove-outline" size={19} color="#E24B4A" />
        <Text style={estilos.textoEliminar}>{traducir(idioma, 'eliminarCuenta')}</Text>
      </TouchableOpacity>

      <Text style={[estilos.etiquetaSeccion, { color: colores.textoSecundario }]}>{textos.idioma}</Text>
      <View style={[estilos.bloque, { backgroundColor: colores.superficie, borderColor: colores.borde }]}>
        <TouchableOpacity
          style={[estilos.opcion, idioma === 'es' && estilos.opcionActiva]}
          onPress={() => elegirIdioma('es')}
        >
          <Text style={estilos.codigoIdioma}>ES</Text>
          <Text style={[estilos.textoOpcion, { color: colores.texto }]}>{textos.espanol}</Text>
          {idioma === 'es' && <MaterialCommunityIcons name="check" size={20} color="#E0B84B" />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[estilos.opcion, idioma === 'en' && estilos.opcionActiva]}
          onPress={() => elegirIdioma('en')}
        >
          <Text style={estilos.codigoIdioma}>EN</Text>
          <Text style={[estilos.textoOpcion, { color: colores.texto }]}>{textos.ingles}</Text>
          {idioma === 'en' && <MaterialCommunityIcons name="check" size={20} color="#E0B84B" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, padding: 16 },
  titulo: { fontSize: 20, fontWeight: '700', marginBottom: 24 },
  etiquetaSeccion: { fontSize: 12, marginBottom: 8, marginTop: 8 },
  bloque: { borderWidth: 0.5, borderRadius: 10, overflow: 'hidden', marginBottom: 12 },
  opcion: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14 },
  opcionActiva: { backgroundColor: 'rgba(224,184,75,0.12)' },
  textoOpcion: { flex: 1, fontSize: 14 },
  codigoIdioma: { width: 28, fontSize: 12, fontWeight: '700', color: '#E0B84B' },
  botonCerrar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 0.5, borderRadius: 8, padding: 12, marginTop: 20 },
  textoCerrar: { color: '#E24B4A', fontSize: 13, fontWeight: '600' },
  botonEliminar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 0.5, borderRadius: 8, padding: 12, marginTop: 10 },
  textoEliminar: { color: '#E24B4A', fontSize: 13, fontWeight: '600' },
  datoCuenta: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  etiquetaCuenta: { fontSize: 11, marginBottom: 3 },
  valorCuenta: { fontSize: 13 },
});
