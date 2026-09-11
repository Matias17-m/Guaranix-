import type { Presupuesto } from '@/tipos';
import { supabase } from '@/configuracion/supabase';

async function obtenerUsuarioId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('No hay una sesión activa.');
  return data.user.id;
}

function mapearPresupuesto(presupuesto: any): Presupuesto {
  return {
    id: Number(presupuesto.id),
    categoriaId: presupuesto.categoria_id === null ? null : Number(presupuesto.categoria_id),
    montoLimite: Number(presupuesto.monto_limite),
    periodo: presupuesto.periodo,
    mesOSemana: presupuesto.mes_o_semana,
  };
}

export async function obtenerPresupuestosRemotos(mesOSemana: string): Promise<Presupuesto[]> {
  const usuarioId = await obtenerUsuarioId();
  const { data, error } = await supabase
    .from('presupuesto')
    .select('id, categoria_id, monto_limite, periodo, mes_o_semana')
    .eq('user_id', usuarioId)
    .eq('mes_o_semana', mesOSemana)
    .order('id', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapearPresupuesto);
}

export async function guardarPresupuestoRemoto(
  categoriaId: number | null,
  montoLimite: number,
  periodo: 'mensual' | 'semanal' | 'diario',
  mesOSemana: string,
): Promise<void> {
  const usuarioId = await obtenerUsuarioId();
  let consulta = supabase
    .from('presupuesto')
    .select('id')
    .eq('user_id', usuarioId)
    .eq('periodo', periodo)
    .eq('mes_o_semana', mesOSemana);

  consulta = categoriaId === null ? consulta.is('categoria_id', null) : consulta.eq('categoria_id', categoriaId);
  const { data: existente, error: errorBusqueda } = await consulta.maybeSingle();
  if (errorBusqueda) throw errorBusqueda;

  if (existente) {
    const { error } = await supabase
      .from('presupuesto')
      .update({ monto_limite: montoLimite })
      .eq('id', existente.id)
      .eq('user_id', usuarioId);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('presupuesto').insert({
    user_id: usuarioId,
    categoria_id: categoriaId,
    monto_limite: montoLimite,
    periodo,
    mes_o_semana: mesOSemana,
  });
  if (error) throw error;
}
