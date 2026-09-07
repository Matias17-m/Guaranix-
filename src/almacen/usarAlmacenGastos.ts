import { create } from 'zustand';
import type { CategoriaGasto, Gasto } from '@/tipos';
import {
  eliminarCategoria,
  eliminarGasto,
  obtenerCategorias,
  obtenerGastosEntreFechas,
  obtenerGastosDelMes,
  registrarGasto,
} from '@/bd/consultas';

interface EstadoGastos {
  categorias: CategoriaGasto[];
  gastosDelMes: Gasto[];
  mesActual: string; // formato "2026-09"
  cargarCategorias: () => void;
  cargarGastosDelMes: (mes?: string) => void;
  cargarGastosEntreFechas: (fechaDesde: string, fechaHasta: string) => void;
  agregarGasto: (gasto: Omit<Gasto, 'id' | 'creadoEn'>) => void;
  borrarGasto: (id: number) => void;
  borrarCategoria: (id: number) => void;
}

function obtenerMesActual(): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}`;
}

export const usarAlmacenGastos = create<EstadoGastos>((set, get) => ({
  categorias: [],
  gastosDelMes: [],
  mesActual: obtenerMesActual(),

  cargarCategorias: () => {
    const categorias = obtenerCategorias();
    set({ categorias });
  },

  cargarGastosDelMes: (mes) => {
    const mesAConsultar = mes ?? get().mesActual;
    const gastos = obtenerGastosDelMes(mesAConsultar);
    set({ gastosDelMes: gastos, mesActual: mesAConsultar });
  },

  cargarGastosEntreFechas: (fechaDesde, fechaHasta) => {
    const gastos = obtenerGastosEntreFechas(fechaDesde, fechaHasta);
    set({ gastosDelMes: gastos });
  },

  agregarGasto: (gasto) => {
    registrarGasto(gasto);
    get().cargarGastosDelMes();
  },

  borrarGasto: (id) => {
    eliminarGasto(id);
    get().cargarGastosDelMes();
  },

  borrarCategoria: (id) => {
    eliminarCategoria(id);
    get().cargarCategorias();
    get().cargarGastosDelMes();
  },
}));
