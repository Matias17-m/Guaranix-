import baseDeDatos from './basededatos';
import type { CategoriaGasto, Gasto, Ingreso, Presupuesto } from '@/tipos';

export function obtenerCategorias(): CategoriaGasto[] {
  return baseDeDatos.getAllSync<CategoriaGasto>(
    'SELECT id, nombre, icono, color FROM categorias_gasto ORDER BY nombre'
  );
}

export function crearCategoria(nombre: string, icono: string, color: string): number {
  const resultado = baseDeDatos.runSync(
    'INSERT INTO categorias_gasto (nombre, icono, color) VALUES (?, ?, ?)',
    [nombre, icono, color]
  );
  return resultado.lastInsertRowId;
}

export function eliminarCategoria(id: number): void {
  baseDeDatos.runSync('DELETE FROM gastos WHERE categoria_id = ?', [id]);
  baseDeDatos.runSync('DELETE FROM presupuesto WHERE categoria_id = ?', [id]);
  baseDeDatos.runSync('DELETE FROM categorias_gasto WHERE id = ?', [id]);
}

export function registrarGasto(gasto: Omit<Gasto, 'id' | 'creadoEn'>): number {
  const creadoEn = new Date().toISOString();
  const resultado = baseDeDatos.runSync(
    `INSERT INTO gastos (categoria_id, descripcion, monto, moneda, fecha, creado_en)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [gasto.categoriaId, gasto.descripcion, gasto.monto, gasto.moneda, gasto.fecha, creadoEn]
  );
  return resultado.lastInsertRowId;
}

export function eliminarGasto(id: number): void {
  baseDeDatos.runSync('DELETE FROM gastos WHERE id = ?', [id]);
}

export function obtenerGastosDelMes(mes: string): Gasto[] {
  return baseDeDatos.getAllSync<Gasto>(
    `SELECT id, categoria_id as categoriaId, descripcion, monto, moneda, fecha, creado_en as creadoEn
     FROM gastos
     WHERE fecha LIKE ?
     ORDER BY fecha DESC, creado_en DESC`,
    [`${mes}%`]
  );
}

export function obtenerGastosEntreFechas(fechaDesde: string, fechaHasta: string): Gasto[] {
  return baseDeDatos.getAllSync<Gasto>(
    `SELECT id, categoria_id as categoriaId, descripcion, monto, moneda, fecha, creado_en as creadoEn
     FROM gastos
     WHERE fecha BETWEEN ? AND ?
     ORDER BY fecha DESC, creado_en DESC`,
    [fechaDesde, fechaHasta]
  );
}

export function registrarIngreso(ingreso: Omit<Ingreso, 'id'>): number {
  const resultado = baseDeDatos.runSync(
    'INSERT INTO ingresos (descripcion, monto, moneda, fecha) VALUES (?, ?, ?, ?)',
    [ingreso.descripcion, ingreso.monto, ingreso.moneda, ingreso.fecha]
  );
  return resultado.lastInsertRowId;
}

export function obtenerPresupuesto(mesOSemana: string): Presupuesto[] {
  return baseDeDatos.getAllSync<Presupuesto>(
    `SELECT id, categoria_id as categoriaId, monto_limite as montoLimite, periodo, mes_o_semana as mesOSemana
     FROM presupuesto
     WHERE mes_o_semana = ?
     ORDER BY id DESC`,
    [mesOSemana]
  );
}

export function definirPresupuesto(presupuesto: Omit<Presupuesto, 'id'>): number {
  const resultado = baseDeDatos.runSync(
    `INSERT INTO presupuesto (categoria_id, monto_limite, periodo, mes_o_semana)
     VALUES (?, ?, ?, ?)`,
    [presupuesto.categoriaId, presupuesto.montoLimite, presupuesto.periodo, presupuesto.mesOSemana]
  );
  return resultado.lastInsertRowId;
}

export function guardarPresupuestoPorCategoria(
  categoriaId: number | null,
  montoLimite: number,
  periodo: 'mensual' | 'semanal' | 'diario',
  mesOSemana: string
) {
  const existente = categoriaId === null
    ? baseDeDatos.getFirstSync<{ id: number }>(
        'SELECT id FROM presupuesto WHERE categoria_id IS NULL AND periodo = ? AND mes_o_semana = ? ORDER BY id DESC',
        [periodo, mesOSemana]
      )
    : baseDeDatos.getFirstSync<{ id: number }>(
        'SELECT id FROM presupuesto WHERE categoria_id = ? AND periodo = ? AND mes_o_semana = ? ORDER BY id DESC',
        [categoriaId, periodo, mesOSemana]
      );

  if (existente) {
    baseDeDatos.runSync('UPDATE presupuesto SET monto_limite = ? WHERE id = ?', [
      montoLimite,
      existente.id,
    ]);
  } else {
    definirPresupuesto({ categoriaId, montoLimite, periodo, mesOSemana });
  }
}
