import type { Ingreso } from '@/tipos';
import { supabase } from '@/configuracion/supabase';

async function obtenerUsuarioId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('No hay una sesión activa.');
  return data.user.id;
}

function mapearIngreso(ingreso: any): Ingreso {
  return {
    id: Number(ingreso.id),
    descripcion: ingreso.descripcion ?? '',
    monto: Number(ingreso.monto),
    moneda: ingreso.moneda,
    fecha: ingreso.fecha,
  };
}

export async function obtenerIngresosEntreFechasRemotos(fechaDesde: string, fechaHasta: string): Promise<Ingreso[]> {
  const usuarioId = await obtenerUsuarioId();
  const { data, error } = await supabase
    .from('ingresos')
    .select('id, descripcion, monto, moneda, fecha')
    .eq('user_id', usuarioId)
    .gte('fecha', fechaDesde)
    .lte('fecha', fechaHasta)
    .order('fecha', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapearIngreso);
}

export async function registrarIngresoRemoto(ingreso: Omit<Ingreso, 'id'>): Promise<number> {
  const usuarioId = await obtenerUsuarioId();
  const { data, error } = await supabase
    .from('ingresos')
    .insert({
      user_id: usuarioId,
      descripcion: ingreso.descripcion,
      monto: ingreso.monto,
      moneda: ingreso.moneda,
      fecha: ingreso.fecha,
    })
    .select('id')
    .single();
  if (error) throw error;
  return Number(data.id);
}

export async function eliminarIngresoRemoto(id: number): Promise<void> {
  const usuarioId = await obtenerUsuarioId();
  const { error } = await supabase
    .from('ingresos')
    .delete()
    .eq('id', id)
    .eq('user_id', usuarioId);
  if (error) throw error;
}
