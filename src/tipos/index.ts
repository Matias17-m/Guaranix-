export type Moneda = 'PYG' | 'USD';

export type Periodo = 'mensual' | 'semanal' | 'diario';

export interface CategoriaGasto {
  id: number;
  nombre: string;
  icono: string;
  color: string;
}

export interface Gasto {
  id: number;
  categoriaId: number;
  descripcion: string;
  monto: number;
  moneda: Moneda;
  fecha: string; // formato ISO: YYYY-MM-DD
  creadoEn: string;
}

export interface Ingreso {
  id: number;
  descripcion: string;
  monto: number;
  moneda: Moneda;
  fecha: string;
}

export interface Presupuesto {
  id: number;
  categoriaId: number | null; // null = presupuesto general
  montoLimite: number;
  periodo: Periodo;
  mesOSemana: string; // ej. "2026-09" o "2026-W36"
}

export interface ResumenMensual {
  totalGastado: number;
  totalPresupuestado: number;
  totalIngresos: number;
  gastosPorCategoria: { categoria: CategoriaGasto; monto: number }[];
}
