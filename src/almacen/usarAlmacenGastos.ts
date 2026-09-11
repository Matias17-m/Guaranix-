import { create } from 'zustand';
import type { CategoriaGasto, Gasto } from '@/tipos';
import {
  crearCategoriaRemota,
  eliminarCategoriaRemota,
  eliminarGastoRemoto,
  obtenerCategoriasRemotas,
  obtenerGastosEntreFechasRemotos,
  obtenerGastosDelMesRemotos,
  registrarGastoRemoto,
} from '@/bd/consultasRemotas';
import { obtenerFechaHoyISO } from '@/utilidades/formato';

interface EstadoGastos {
  categorias: CategoriaGasto[];
  gastosDelMes: Gasto[];
  fechaSeleccionada: string;
  mesActual: string; // formato "2026-09"
  cargando: boolean;
  error: string | null;
  cargarCategorias: () => Promise<void>;
  cargarGastosDelMes: (mes?: string) => Promise<void>;
  cargarGastosEntreFechas: (fechaDesde: string, fechaHasta: string) => Promise<void>;
  setFechaSeleccionada: (fecha: string) => void;
  limpiarDatos: () => void;
  agregarGasto: (gasto: Omit<Gasto, 'id' | 'creadoEn'>) => Promise<void>;
  borrarGasto: (id: number) => Promise<void>;
  crearCategoria: (nombre: string, icono: string, color: string) => Promise<void>;
  borrarCategoria: (id: number) => Promise<void>;
  limpiarError: () => void;
}

function obtenerMensajeError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) return String(error.message);
  return 'No se pudieron cargar los datos. Revisa tu conexión e intenta nuevamente.';
}

function obtenerMesActual(): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}`;
}

export const usarAlmacenGastos = create<EstadoGastos>((set, get) => ({
  categorias: [],
  gastosDelMes: [],
  fechaSeleccionada: obtenerFechaHoyISO(),
  mesActual: obtenerMesActual(),
  cargando: false,
  error: null,

  cargarCategorias: async () => {
    set({ cargando: true, error: null });
    try {
      const categorias = await obtenerCategoriasRemotas();
      set({ categorias, cargando: false });
    } catch (error) {
      set({ cargando: false, error: obtenerMensajeError(error) });
    }
  },

  cargarGastosDelMes: async (mes) => {
    const mesAConsultar = mes ?? get().mesActual;
    set({ cargando: true, error: null });
    try {
      const gastos = await obtenerGastosDelMesRemotos(mesAConsultar);
      set({ gastosDelMes: gastos, mesActual: mesAConsultar, cargando: false });
    } catch (error) {
      set({ cargando: false, error: obtenerMensajeError(error) });
    }
  },

  cargarGastosEntreFechas: async (fechaDesde, fechaHasta) => {
    set({ cargando: true, error: null });
    try {
      const gastos = await obtenerGastosEntreFechasRemotos(fechaDesde, fechaHasta);
      set({ gastosDelMes: gastos, cargando: false });
    } catch (error) {
      set({ cargando: false, error: obtenerMensajeError(error) });
    }
  },

  setFechaSeleccionada: (fecha) => set({ fechaSeleccionada: fecha }),

  limpiarDatos: () => set({ categorias: [], gastosDelMes: [], mesActual: obtenerMesActual(), cargando: false, error: null }),

  agregarGasto: async (gasto) => {
    set({ cargando: true, error: null });
    try {
      await registrarGastoRemoto(gasto);
      await get().cargarGastosDelMes();
    } catch (error) {
      set({ cargando: false, error: obtenerMensajeError(error) });
    }
  },

  borrarGasto: async (id) => {
    set({ cargando: true, error: null });
    try {
      await eliminarGastoRemoto(id);
      await get().cargarGastosDelMes();
    } catch (error) {
      set({ cargando: false, error: obtenerMensajeError(error) });
    }
  },

  crearCategoria: async (nombre, icono, color) => {
    set({ cargando: true, error: null });
    try {
      await crearCategoriaRemota(nombre, icono, color);
      await get().cargarCategorias();
    } catch (error) {
      set({ cargando: false, error: obtenerMensajeError(error) });
    }
  },

  borrarCategoria: async (id) => {
    set({ cargando: true, error: null });
    try {
      await eliminarCategoriaRemota(id);
      await get().cargarCategorias();
      await get().cargarGastosDelMes();
    } catch (error) {
      set({ cargando: false, error: obtenerMensajeError(error) });
    }
  },

  limpiarError: () => set({ error: null }),
}));
