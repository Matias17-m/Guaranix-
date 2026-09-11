import type { CategoriaGasto, Gasto } from '@/tipos';
import { supabase } from '@/configuracion/supabase';

async function obtenerUsuarioId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('No hay una sesión activa.');
  return data.user.id;
}

export async function obtenerCategoriasRemotas(): Promise<CategoriaGasto[]> {
  const usuarioId = await obtenerUsuarioId();
  const { data, error } = await supabase
    .from('categorias_gasto')
    .select('id, nombre, icono, color')
    .eq('user_id', usuarioId)
    .order('nombre');
  if (error) throw error;
  return (data ?? []) as CategoriaGasto[];
}

export async function crearCategoriaRemota(nombre: string, icono: string, color: string): Promise<number> {
  const usuarioId = await obtenerUsuarioId();
  const { data, error } = await supabase
    .from('categorias_gasto')
    .insert({ user_id: usuarioId, nombre, icono, color })
    .select('id')
    .single();
  if (error) throw error;
  return Number(data.id);
}

export async function eliminarCategoriaRemota(id: number): Promise<void> {
  const usuarioId = await obtenerUsuarioId();
  const { error } = await supabase
    .from('categorias_gasto')
    .delete()
    .eq('id', id)
    .eq('user_id', usuarioId);
  if (error) throw error;
}

function mapearGasto(gasto: any): Gasto {
  return {
    id: Number(gasto.id),
    categoriaId: Number(gasto.categoria_id),
    descripcion: gasto.descripcion ?? '',
    monto: Number(gasto.monto),
    moneda: gasto.moneda,
    fecha: gasto.fecha,
    creadoEn: gasto.creado_en,
  };
}

export async function obtenerGastosDelMesRemotos(mes: string): Promise<Gasto[]> {
  const usuarioId = await obtenerUsuarioId();
  const [año, mesNumero] = mes.split('-').map(Number);
  const siguienteMes = mesNumero === 12
    ? `${año + 1}-01-01`
    : `${año}-${String(mesNumero + 1).padStart(2, '0')}-01`;
  const { data, error } = await supabase
    .from('gastos')
    .select('id, categoria_id, descripcion, monto, moneda, fecha, creado_en')
    .eq('user_id', usuarioId)
    .gte('fecha', `${mes}-01`)
    .lt('fecha', siguienteMes)
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapearGasto);
}

export async function obtenerGastosEntreFechasRemotos(fechaDesde: string, fechaHasta: string): Promise<Gasto[]> {
  const usuarioId = await obtenerUsuarioId();
  const { data, error } = await supabase
    .from('gastos')
    .select('id, categoria_id, descripcion, monto, moneda, fecha, creado_en')
    .eq('user_id', usuarioId)
    .gte('fecha', fechaDesde)
    .lte('fecha', fechaHasta)
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapearGasto);
}

export async function registrarGastoRemoto(gasto: Omit<Gasto, 'id' | 'creadoEn'>): Promise<number> {
  const usuarioId = await obtenerUsuarioId();
  const { data, error } = await supabase
    .from('gastos')
    .insert({
      user_id: usuarioId,
      categoria_id: gasto.categoriaId,
      descripcion: gasto.descripcion,
      monto: gasto.monto,
      moneda: gasto.moneda,
      fecha: gasto.fecha,
    })
    .select('id')
    .single();
  if (error) throw error;
  return Number(data.id);
}

export async function eliminarGastoRemoto(id: number): Promise<void> {
  const usuarioId = await obtenerUsuarioId();
  const { error } = await supabase
    .from('gastos')
    .delete()
    .eq('id', id)
    .eq('user_id', usuarioId);
  if (error) throw error;
}
