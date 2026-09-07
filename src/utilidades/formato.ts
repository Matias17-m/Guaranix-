export function formatearGuaranies(monto: number): string {
  return `₲ ${Math.round(monto).toLocaleString('es-PY')}`;
}

export function obtenerMesActualISO(): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}`;
}

export function obtenerSemanaActualISO(): string {
  return obtenerSemanaISO(new Date());
}

export function obtenerSemanaISO(fecha: Date): string {
  const fechaISO = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const dia = fechaISO.getDay() || 7;
  fechaISO.setDate(fechaISO.getDate() + 4 - dia);
  const inicioAño = new Date(fechaISO.getFullYear(), 0, 1);
  const numeroSemana = Math.ceil(((fechaISO.getTime() - inicioAño.getTime()) / 86400000 + 1) / 7);
  return `${fechaISO.getFullYear()}-W${String(numeroSemana).padStart(2, '0')}`;
}

export function obtenerMesDeFechaISO(fechaISO: string): string {
  return fechaISO.slice(0, 7);
}

export function convertirISOaFechaLocal(fechaISO: string): Date {
  return new Date(
    Number(fechaISO.slice(0, 4)),
    Number(fechaISO.slice(5, 7)) - 1,
    Number(fechaISO.slice(8, 10)),
  );
}

export function obtenerFechaISO(fecha: Date): string {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

export function obtenerFechaHoyISO(): string {
  return obtenerFechaISO(new Date());
}
