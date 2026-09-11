import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { coloresTema, usarTema } from '@/almacen/usarTema';
import { usarSesion } from '@/almacen/usarSesion';

export default function PantallaRestablecerContrasena() {
  const modo = usarTema((estado) => estado.modo);
  const colores = coloresTema[modo];
  const { actualizarContrasena, cancelarRecuperacion, cargando, error } = usarSesion();
  const [contrasena, setContrasena] = useState('');
  const [repetida, setRepetida] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [mostrar, setMostrar] = useState(false);

  async function guardar() {
    setMensaje('');
    if (contrasena.length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (contrasena !== repetida) {
      setMensaje('Las contraseñas no coinciden.');
      return;
    }
    await actualizarContrasena(contrasena);
  }

  return (
    <SafeAreaView style={[estilos.contenedor, { backgroundColor: colores.fondo }]}>
      <View style={[estilos.tarjeta, { backgroundColor: colores.superficie, borderColor: colores.borde }]}>
        <View style={estilos.icono}><MaterialCommunityIcons name="lock-reset" size={30} color="#101010" /></View>
        <Text style={[estilos.titulo, { color: colores.texto }]}>Nueva contraseña</Text>
        <Text style={[estilos.subtitulo, { color: colores.textoSecundario }]}>Crea una contraseña nueva para tu cuenta.</Text>

        <Text style={[estilos.etiqueta, { color: colores.textoSecundario }]}>Nueva contraseña</Text>
        <View style={[estilos.fila, { backgroundColor: colores.campo, borderColor: colores.borde }]}>
          <TextInput
            style={[estilos.input, { color: colores.textoCampo }]}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={colores.textoSecundario}
            secureTextEntry={!mostrar}
            value={contrasena}
            onChangeText={setContrasena}
          />
          <TouchableOpacity onPress={() => setMostrar((visible) => !visible)}>
            <MaterialCommunityIcons name={mostrar ? 'eye-off-outline' : 'eye-outline'} size={21} color={colores.textoSecundario} />
          </TouchableOpacity>
        </View>

        <Text style={[estilos.etiqueta, { color: colores.textoSecundario }]}>Repetir contraseña</Text>
        <TextInput
          style={[estilos.inputSimple, { backgroundColor: colores.campo, borderColor: colores.borde, color: colores.textoCampo }]}
          placeholder="Repite tu contraseña"
          placeholderTextColor={colores.textoSecundario}
          secureTextEntry={!mostrar}
          value={repetida}
          onChangeText={setRepetida}
        />

        {(error || mensaje) && <Text style={estilos.mensaje}>{error || mensaje}</Text>}
        <TouchableOpacity style={estilos.boton} onPress={guardar} disabled={cargando}>
          {cargando ? <ActivityIndicator color="#101010" /> : <Text style={estilos.textoBoton}>Guardar contraseña</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={estilos.cancelar} onPress={cancelarRecuperacion}>
          <Text style={[estilos.textoCancelar, { color: colores.textoSecundario }]}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', padding: 20 },
  tarjeta: { borderWidth: 0.5, borderRadius: 16, padding: 22 },
  icono: { width: 64, height: 64, borderRadius: 18, backgroundColor: '#F8C514', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 14 },
  titulo: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitulo: { fontSize: 13, textAlign: 'center', marginTop: 5, marginBottom: 18 },
  etiqueta: { fontSize: 12, marginBottom: 6, marginTop: 10 },
  fila: { flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderRadius: 8, paddingHorizontal: 12 },
  input: { flex: 1, paddingVertical: 12, paddingRight: 8, fontSize: 14 },
  inputSimple: { borderWidth: 0.5, borderRadius: 8, padding: 12, fontSize: 14 },
  mensaje: { color: '#E24B4A', fontSize: 12, marginTop: 12 },
  boton: { backgroundColor: '#E0B84B', borderRadius: 8, padding: 13, alignItems: 'center', marginTop: 18 },
  textoBoton: { color: '#101010', fontSize: 14, fontWeight: '700' },
  cancelar: { alignItems: 'center', padding: 12 },
  textoCancelar: { fontSize: 13 },
});
