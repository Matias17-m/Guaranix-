import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usarAlmacenGastos } from '@/almacen/usarAlmacenGastos';
import { obtenerPresupuesto } from '@/bd/consultas';
import {
  formatearGuaranies,
  convertirISOaFechaLocal,
  obtenerFechaHoyISO,
  obtenerFechaISO,
  obtenerMesDeFechaISO,
  obtenerSemanaISO,
} from '@/utilidades/formato';

function normalizarFecha(fecha: Date | string): Date {
  const d = typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ? new Date(
        Number(fecha.slice(0, 4)),
        Number(fecha.slice(5, 7)) - 1,
        Number(fecha.slice(8, 10)),
      )
    : new Date(fecha);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function obtenerInicioDeSemana(fecha: Date): Date {
  const diaSemana = fecha.getDay(); // 0 = domingo
  const diferencia = diaSemana === 0 ? 6 : diaSemana - 1; // semana inicia el lunes

  const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() - diferencia);
  return inicio;
}

export default function PantallaInicio() {
  const { categorias, gastosDelMes, cargarCategorias, cargarGastosDelMes } = usarAlmacenGastos();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(obtenerFechaHoyISO());
  const [periodoCategorias, setPeriodoCategorias] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [presupuestoMensual, setPresupuestoMensual] = useState(2000000);
  const [presupuestoSemanal, setPresupuestoSemanal] = useState(500000);
  const [presupuestoDiario, setPresupuestoDiario] = useState(100000);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const recargarPresupuestos = useCallback(() => {
    const fecha = convertirISOaFechaLocal(fechaSeleccionada);
    const presupuestoMes = obtenerPresupuesto(obtenerMesDeFechaISO(fechaSeleccionada)).find((p) => p.categoriaId === null && p.periodo === 'mensual');
    const presupuestoSemana = obtenerPresupuesto(obtenerSemanaISO(fecha)).find((p) => p.categoriaId === null && p.periodo === 'semanal');
    const presupuestoDia = obtenerPresupuesto(fechaSeleccionada).find((p) => p.categoriaId === null && p.periodo === 'diario');
    setPresupuestoMensual(presupuestoMes?.montoLimite ?? 2000000);
    setPresupuestoSemanal(presupuestoSemana?.montoLimite ?? 500000);
    setPresupuestoDiario(presupuestoDia?.montoLimite ?? 100000);
  }, [fechaSeleccionada]);

  useFocusEffect(
    useCallback(() => {
      cargarCategorias();
      cargarGastosDelMes(obtenerMesDeFechaISO(fechaSeleccionada));
      recargarPresupuestos();
    }, [cargarCategorias, cargarGastosDelMes, fechaSeleccionada, recargarPresupuestos]),
  );

  useEffect(() => {
    const fecha = convertirISOaFechaLocal(fechaSeleccionada);
    cargarGastosDelMes(obtenerMesDeFechaISO(fechaSeleccionada));
    recargarPresupuestos();
  }, [fechaSeleccionada, recargarPresupuestos]);

  const fechaElegida = convertirISOaFechaLocal(fechaSeleccionada);
  const hoyNormalizado = normalizarFecha(fechaElegida).getTime();
  const inicioSemanaNormalizado = obtenerInicioDeSemana(fechaElegida).getTime();
  const diasCarrusel = Array.from({ length: 7 }, (_, indice) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + indice - 3);
    return fecha;
  });
  const presupuestosMensuales = obtenerPresupuesto(obtenerMesDeFechaISO(fechaSeleccionada));

  function gastoCoincideConPeriodo(fechaGasto: string): boolean {
    const fechaNormalizada = normalizarFecha(fechaGasto).getTime();
    if (periodoCategorias === 'dia') return fechaNormalizada === hoyNormalizado;
    if (periodoCategorias === 'mes') {
      return fechaGasto.slice(0, 7) === fechaSeleccionada.slice(0, 7);
    }
    return fechaNormalizada >= inicioSemanaNormalizado;
  }

  // --- CÁLCULOS DE GASTOS ---
  const totalGastadoMes = gastosDelMes.reduce((suma, gasto) => suma + gasto.monto, 0);

 // Cálculo de hoy
  const totalHoy = gastosDelMes
    .filter((gasto) => {
      const fechaGasto = normalizarFecha(gasto.fecha).getTime();
      return fechaGasto === hoyNormalizado;
    })
    .reduce((suma, gasto) => suma + gasto.monto, 0);

  // Cálculo de la semana
  const totalSemana = gastosDelMes
    .filter((gasto) => {
      const fechaGasto = normalizarFecha(gasto.fecha).getTime();
      return fechaGasto >= inicioSemanaNormalizado;
    })
    .reduce((suma, gasto) => suma + gasto.monto, 0);

  // --- PORCENTAJES DE PROGRESO (Limitados al 100%) ---
  const pctMesCalculado = ((totalGastadoMes / presupuestoMensual) * 100).toFixed(1);
  const pctMesBarra = Math.min(100, Math.round((totalGastadoMes / presupuestoMensual) * 100));

  const pctSemanaCalculado = ((totalSemana / presupuestoSemanal) * 100).toFixed(1);
  const pctHoyCalculado = ((totalHoy / presupuestoDiario) * 100).toFixed(1);
  const pctSemanaBarra = Math.min(100, Math.round((totalSemana / presupuestoSemanal) * 100));
  const pctHoyBarra = Math.min(100, Math.round((totalHoy / presupuestoDiario) * 100));

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top']}>
      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <Text style={estilos.saludo}>Hola, Matias</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.carruselDias}>
          {diasCarrusel.map((dia) => {
            const iso = obtenerFechaISO(dia);
            const seleccionado = iso === fechaSeleccionada;
            return (
              <TouchableOpacity
                key={iso}
                style={[estilos.diaItem, seleccionado && estilos.diaItemActivo]}
                onPress={() => setFechaSeleccionada(iso)}
              >
                <Text style={[estilos.diaSemana, seleccionado && estilos.textoDiaActivo]}>
                  {dia.toLocaleDateString('es-PY', { weekday: 'short' }).replace('.', '')}
                </Text>
                <Text style={[estilos.numeroDia, seleccionado && estilos.textoDiaActivo]}>
                  {dia.getDate()}
                </Text>
                {iso === obtenerFechaHoyISO() && <View style={estilos.puntoHoy} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={estilos.fechaSeleccionada}>
          Gastos del {fechaElegida.toLocaleDateString('es-PY', { day: 'numeric', month: 'long' })}
        </Text>

        {/* 1. Tarjeta Resumen Mes */}
        <View style={estilos.tarjetaResumen}>
          <Text style={estilos.etiqueta}>Gastado este mes</Text>
          <Text style={estilos.montoGrande}>{formatearGuaranies(totalGastadoMes)}</Text>
          
          <View style={estilos.barraFondo}>
            <View style={[estilos.barraProgreso, { width: `${pctMesBarra}%` }]} />
          </View>
          
          <View style={estilos.filaPresupuesto}>
            <Text style={estilos.etiquetaChica}>
              de {formatearGuaranies(presupuestoMensual)} presupuestados
            </Text>
            <Text style={estilos.porcentajeTexto}>{pctMesCalculado}%</Text>
          </View>
        </View>

        {/* 2. Grilla Hoy vs Esta Semana con Barras de Progreso */}
        <View style={estilos.grillaMétricas}>
          {/* Tarjeta Hoy */}
          <View style={estilos.tarjetaGrilla}>
            <Text style={estilos.etiqueta}>Gastado ese día</Text>
            <Text style={estilos.montoMediano}>{formatearGuaranies(totalHoy)}</Text>
            
            {/* Barra que se mueve dinámicamente según lo gastado hoy */}
            <View style={estilos.barraFondoChica}>
              <View style={[estilos.barraProgreso, { width: `${pctHoyBarra}%` }]} />
            </View>
            <Text style={estilos.limiteMetrica}>
              de {formatearGuaranies(presupuestoDiario)} presupuestados ({pctHoyCalculado}%)
            </Text>
          </View>

          {/* Tarjeta Semana */}
          <View style={estilos.tarjetaGrilla}>
            <Text style={estilos.etiqueta}>Gastado esta semana</Text>
            <Text style={estilos.montoMediano}>{formatearGuaranies(totalSemana)}</Text>
            
            {/* Barra que se mueve dinámicamente según lo gastado esta semana */}
            <View style={estilos.barraFondoChica}>
              <View style={[estilos.barraProgreso, { width: `${pctSemanaBarra}%` }]} />
            </View>
            <Text style={estilos.limiteMetrica}>
              de {formatearGuaranies(presupuestoSemanal)} presupuestados ({pctSemanaCalculado}%)
            </Text>
          </View>
        </View>

        {/* Categorías */}
        <Text style={estilos.subtitulo}>Por categoría</Text>
        <View style={estilos.selectorPeriodoCategorias}>
          {(['dia', 'semana', 'mes'] as const).map((periodo) => (
            <TouchableOpacity
              key={periodo}
              style={[estilos.opcionPeriodo, periodoCategorias === periodo && estilos.opcionPeriodoActiva]}
              onPress={() => setPeriodoCategorias(periodo)}
            >
              <Text style={[estilos.textoPeriodo, periodoCategorias === periodo && estilos.textoPeriodoActivo]}>
                {periodo === 'dia' ? 'Día' : periodo === 'semana' ? 'Semana' : 'Mes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={estilos.bloqueCategorias}>
          {categorias.map((categoria) => {
            const totalCategoria = gastosDelMes
              .filter((gasto) => (
                gasto.categoriaId === categoria.id
                && gastoCoincideConPeriodo(gasto.fecha)
              ))
              .reduce((suma, gasto) => suma + gasto.monto, 0);

            if (totalCategoria === 0) return null;

            return (
              <View key={categoria.id} style={estilos.filaCategoria}>
                <View style={estilos.iconoContenedor}>
                  <MaterialCommunityIcons 
                    name={(categoria.icono as any) || 'silverware-fork-knife'} 
                    size={18} 
                    color={categoria.color}
                  />
                </View>
                <Text style={estilos.nombreCategoria}>{categoria.nombre}</Text>
                <Text style={estilos.montoCategoria}>{formatearGuaranies(totalCategoria)}</Text>
                <View style={estilos.barraCategoriaFondo}>
                  <View
                    style={[
                      estilos.barraCategoriaProgreso,
                      {
                        width: `${Math.min(100, Math.round((totalCategoria / (presupuestosMensuales.find((presupuesto) => presupuesto.categoriaId === categoria.id)?.montoLimite || 1)) * 100))}%`,
                        backgroundColor: totalCategoria > (presupuestosMensuales.find((presupuesto) => presupuesto.categoriaId === categoria.id)?.montoLimite || 0) ? '#E24B4A' : categoria.color,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Últimos gastos */}
        <Text style={estilos.subtitulo}>Últimos gastos</Text>
        <View style={estilos.tarjetaGastos}>
          <Text style={estilos.etiquetaSeccion}>Ese día</Text>
          {gastosDelMes.filter((gasto) => normalizarFecha(gasto.fecha).getTime() === hoyNormalizado).slice(0, 5).map((gasto, index) => {
            const hora = new Date(gasto.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <View 
                key={gasto.id} 
                style={[
                  estilos.filaGasto, 
                  index === 0 && { borderTopWidth: 0 }
                ]}
              >
                <View style={estilos.iconoGastoContenedor}>
                  <MaterialCommunityIcons name="receipt" size={16} color="#A0A0A0" />
                </View>
                <View style={estilos.infoGasto}>
                  <Text style={estilos.descripcionGasto}>{gasto.descripcion || 'Sin descripción'}</Text>
                  <Text style={estilos.horaGasto}>{hora !== 'Invalid Date' ? hora : '10:16'}</Text>
                </View>
                <Text style={estilos.montoNegativo}>-{formatearGuaranies(gasto.monto)}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#0D0D0D' },
  contenido: { padding: 16, paddingBottom: 32 },
  saludo: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 20, marginTop: 8 },
  carruselDias: { gap: 8, paddingBottom: 12 },
  diaItem: {
    width: 52,
    height: 62,
    borderRadius: 12,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diaItemActivo: { backgroundColor: '#E0B84B' },
  diaSemana: { fontSize: 10, color: '#9E9E9E', textTransform: 'capitalize' },
  numeroDia: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginTop: 3 },
  textoDiaActivo: { color: '#101010' },
  puntoHoy: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#E0B84B', marginTop: 3 },
  fechaSeleccionada: { fontSize: 12, color: '#9E9E9E', marginBottom: 8 },
  
  tarjetaResumen: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  etiqueta: { fontSize: 13, color: '#9E9E9E', marginBottom: 4 },
  montoGrande: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  barraFondo: { height: 6, backgroundColor: '#2A2A2A', borderRadius: 3, overflow: 'hidden' },
  barraFondoChica: { height: 4, backgroundColor: '#2A2A2A', borderRadius: 2, overflow: 'hidden', marginTop: 10 },
  barraProgreso: { height: '100%', backgroundColor: '#E0B84B', borderRadius: 3 },
  filaPresupuesto: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  etiquetaChica: { fontSize: 12, color: '#7A7A7A' },
  porcentajeTexto: { fontSize: 12, fontWeight: '600', color: '#9E9E9E' },

  grillaMétricas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  tarjetaGrilla: {
    flex: 1,
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 16,
  },
  montoMediano: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginTop: 4 },
  limiteMetrica: { fontSize: 10, color: '#7A7A7A', marginTop: 6 },

  subtitulo: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 12, marginTop: 12 },
  selectorPeriodoCategorias: {
    flexDirection: 'row',
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 3,
    marginBottom: 10,
  },
  opcionPeriodo: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 6 },
  opcionPeriodoActiva: { backgroundColor: '#E0B84B' },
  textoPeriodo: { fontSize: 12, color: '#9E9E9E' },
  textoPeriodoActivo: { color: '#101010', fontWeight: '600' },

  bloqueCategorias: { marginBottom: 12 },
  filaCategoria: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#181818',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconoContenedor: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#252219',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nombreCategoria: { flex: 1, fontSize: 14, fontWeight: '500', color: '#FFFFFF' },
  montoCategoria: { fontSize: 14, fontWeight: '500', color: '#B0B0B0' },
  barraCategoriaFondo: { width: 74, height: 6, backgroundColor: '#2A2A2A', borderRadius: 3, overflow: 'hidden', marginLeft: 8 },
  barraCategoriaProgreso: { height: '100%', borderRadius: 3 },

  tarjetaGastos: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 16,
  },
  etiquetaSeccion: { fontSize: 12, fontWeight: '600', color: '#7A7A7A', marginBottom: 8 },
  filaGasto: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#2A2A2A',
  },
  iconoGastoContenedor: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoGasto: { flex: 1 },
  descripcionGasto: { fontSize: 14, fontWeight: '500', color: '#FFFFFF' },
  horaGasto: { fontSize: 11, color: '#7A7A7A', marginTop: 2 },
  montoNegativo: { fontSize: 14, fontWeight: '600', color: '#E24B4A' },
});