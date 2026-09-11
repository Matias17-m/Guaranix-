import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { coloresTema, usarTema } from '@/almacen/usarTema';
import { usarSesion } from '@/almacen/usarSesion';

export default function PantallaAutenticacion() {
  const modo = usarTema((estado) => estado.modo);
  const colores = coloresTema[modo];
  const { iniciarSesion, registrarse, solicitarRecuperacion, cargando, error, limpiarError } = usarSesion();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [modoRecuperacion, setModoRecuperacion] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [repetirContrasena, setRepetirContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarRepetida, setMostrarRepetida] = useState(false);
  const [mensaje, setMensaje] = useState('');

  async function enviarFormulario() {
    setMensaje('');
    limpiarError();
    if (modoRecuperacion) {
      if (!correo.trim()) {
        setMensaje('Ingresa tu correo electrónico.');
        return;
      }
      const enviado = await solicitarRecuperacion(correo);
      if (enviado) setMensaje('Te enviamos un correo para recuperar tu contraseña.');
      return;
    }
    if ((modoRegistro && !nombre.trim()) || !correo.trim() || contrasena.length < 6) {
      setMensaje(modoRegistro
        ? 'Ingresa tu nombre, un correo válido y una contraseña de al menos 6 caracteres.'
        : 'Ingresa un correo válido y una contraseña de al menos 6 caracteres.');
      return;
    }
    if (modoRegistro && contrasena !== repetirContrasena) {
      setMensaje('Las contraseñas no coinciden.');
      return;
    }

    const correcto = modoRegistro
      ? await registrarse(nombre, correo, contrasena)
      : await iniciarSesion(correo, contrasena);

    if (correcto && modoRegistro) {
      setMensaje('Registro correcto. Revisa tu correo si Supabase solicita confirmación.');
    }
  }

  function cambiarModo() {
    limpiarError();
    setMensaje('');
    setModoRegistro((actual) => !actual);
    setModoRecuperacion(false);
  }

  function abrirRecuperacion() {
    limpiarError();
    setMensaje('');
    setModoRegistro(false);
    setModoRecuperacion(true);
  }

  return (
    <SafeAreaView style={[estilos.contenedor, { backgroundColor: colores.fondo }]}>
      <View style={[estilos.tarjeta, { backgroundColor: colores.superficie, borderColor: colores.borde }]}>
        <View style={estilos.logo}>
          <Text style={estilos.logoTexto}>G+</Text>
        </View>
        <Text style={[estilos.titulo, { color: colores.texto }]}>Guaranix</Text>
        <Text style={[estilos.subtitulo, { color: colores.textoSecundario }]}>Controla tus gastos</Text>

        {modoRegistro && (
          <>
            <Text style={[estilos.etiqueta, { color: colores.textoSecundario }]}>Nombre</Text>
            <TextInput
              style={[estilos.input, { backgroundColor: colores.campo, borderColor: colores.borde, color: colores.textoCampo }]}
              placeholder="Tu nombre"
              placeholderTextColor={colores.textoSecundario}
              autoCapitalize="words"
              value={nombre}
              onChangeText={setNombre}
            />
          </>
        )}

        <Text style={[estilos.etiqueta, { color: colores.textoSecundario }]}>Correo electrónico</Text>
        <TextInput
          style={[estilos.input, { backgroundColor: colores.campo, borderColor: colores.borde, color: colores.textoCampo }]}
          placeholder="correo@ejemplo.com"
          placeholderTextColor={colores.textoSecundario}
          keyboardType="email-address"
          autoCapitalize="none"
          value={correo}
          onChangeText={setCorreo}
        />

        {!modoRecuperacion && <Text style={[estilos.etiqueta, { color: colores.textoSecundario }]}>Contraseña</Text>}
        {!modoRecuperacion && <View style={[estilos.filaContrasena, { backgroundColor: colores.campo, borderColor: colores.borde }]}> 
          <TextInput
            style={[estilos.inputContrasena, { color: colores.textoCampo }]}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={colores.textoSecundario}
            secureTextEntry={!mostrarContrasena}
            value={contrasena}
            onChangeText={setContrasena}
          />
          <TouchableOpacity
            onPress={() => setMostrarContrasena((visible) => !visible)}
            accessibilityLabel={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <MaterialCommunityIcons name={mostrarContrasena ? 'eye-off-outline' : 'eye-outline'} size={21} color={colores.textoSecundario} />
          </TouchableOpacity>
        </View>}

        {modoRegistro && !modoRecuperacion && (
          <>
            <Text style={[estilos.etiqueta, { color: colores.textoSecundario }]}>Repetir contraseña</Text>
            <View style={[estilos.filaContrasena, { backgroundColor: colores.campo, borderColor: colores.borde }]}>
              <TextInput
                style={[estilos.inputContrasena, { color: colores.textoCampo }]}
                placeholder="Repite tu contraseña"
                placeholderTextColor={colores.textoSecundario}
                secureTextEntry={!mostrarRepetida}
                value={repetirContrasena}
                onChangeText={setRepetirContrasena}
              />
              <TouchableOpacity
                onPress={() => setMostrarRepetida((visible) => !visible)}
                accessibilityLabel={mostrarRepetida ? 'Ocultar contraseña repetida' : 'Mostrar contraseña repetida'}
              >
                <MaterialCommunityIcons name={mostrarRepetida ? 'eye-off-outline' : 'eye-outline'} size={21} color={colores.textoSecundario} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {(error || mensaje) && <Text style={[estilos.mensaje, { color: error ? '#E24B4A' : '#5CC8A1' }]}>{error || mensaje}</Text>}

        <TouchableOpacity style={estilos.botonPrincipal} onPress={enviarFormulario} disabled={cargando}>
          {cargando ? <ActivityIndicator color="#101010" /> : <Text style={estilos.textoBoton}>{modoRecuperacion ? 'Enviar correo' : modoRegistro ? 'Registrarse' : 'Iniciar sesión'}</Text>}
        </TouchableOpacity>

        {!modoRegistro && !modoRecuperacion && <TouchableOpacity style={estilos.botonSecundario} onPress={abrirRecuperacion}>
          <Text style={[estilos.textoSecundario, { color: colores.textoSecundario }]}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>}

        <TouchableOpacity style={estilos.botonSecundario} onPress={cambiarModo}>
          <Text style={[estilos.textoSecundario, { color: colores.textoSecundario }]}> 
            {modoRecuperacion ? 'Volver a iniciar sesión' : modoRegistro ? 'Ya tengo una cuenta' : 'Crear una cuenta'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', padding: 20 },
  tarjeta: { borderWidth: 0.5, borderRadius: 16, padding: 22 },
  logo: { width: 68, height: 68, borderRadius: 18, backgroundColor: '#F8C514', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12 },
  logoTexto: { color: '#101010', fontSize: 24, fontWeight: '900' },
  titulo: { fontSize: 26, fontWeight: '700', textAlign: 'center' },
  subtitulo: { fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 22 },
  etiqueta: { fontSize: 12, marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 0.5, borderRadius: 8, padding: 12, fontSize: 14 },
  filaContrasena: { flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderRadius: 8, paddingHorizontal: 12 },
  inputContrasena: { flex: 1, paddingVertical: 12, paddingRight: 8, fontSize: 14 },
  mensaje: { fontSize: 12, marginTop: 12, lineHeight: 18 },
  botonPrincipal: { backgroundColor: '#E0B84B', borderRadius: 8, padding: 13, alignItems: 'center', marginTop: 18 },
  textoBoton: { color: '#101010', fontSize: 14, fontWeight: '700' },
  botonSecundario: { alignItems: 'center', padding: 12, marginTop: 4 },
  textoSecundario: { fontSize: 13 },
});
