import type { Idioma } from '@/almacen/usarTema';

type ClaveTraduccion =
  | 'inicio' | 'presupuesto' | 'gastos' | 'resumen' | 'ajustes' | 'registrarGasto'
  | 'hola' | 'gastadoEsteMes' | 'gastadoEseDia' | 'gastadoEstaSemana' | 'presupuestados'
  | 'porCategoria' | 'dia' | 'semana' | 'mes' | 'ultimosGastos' | 'eseDia'
  | 'agregarGasto' | 'monto' | 'descripcionOpcional' | 'guardarGasto' | 'fechaGasto'
  | 'buscarGasto' | 'filtros' | 'todas' | 'rangoFechas' | 'desde' | 'hasta'
  | 'minimo' | 'maximo' | 'ordenarPor' | 'fecha' | 'limpiar' | 'elegirFecha'
  | 'gastoPorCategoria' | 'totalRango' | 'elegir' | 'cancelar' | 'presupuestoGeneral'
  | 'mensual' | 'semanal' | 'diario' | 'anadirCategoria' | 'guardarPresupuesto'
  | 'nuevaCategoria' | 'crear' | 'eliminarGasto' | 'eliminarCategoria' | 'listo'
  | 'presupuestoGuardado' | 'configurandoPara' | 'cerrarSesion' | 'eliminarCuenta' | 'confirmarEliminarCuenta'
  | 'olvidoContrasena' | 'correoRecuperacionEnviado' | 'informacionCuenta' | 'nombre' | 'correo' | 'identificador';

const traducciones: Record<Idioma, Record<ClaveTraduccion, string>> = {
  es: {
    inicio: 'Inicio', presupuesto: 'Presupuesto', gastos: 'Gastos', resumen: 'Resumen', ajustes: 'Ajustes', registrarGasto: 'Registrar gasto',
    hola: 'Hola, Matias', gastadoEsteMes: 'Gastado este mes', gastadoEseDia: 'Gastado ese día', gastadoEstaSemana: 'Gastado esta semana', presupuestados: 'presupuestados',
    porCategoria: 'Por categoría', dia: 'Día', semana: 'Semana', mes: 'Mes', ultimosGastos: 'Últimos gastos', eseDia: 'Ese día',
    agregarGasto: 'Agregar gasto', monto: 'Monto', descripcionOpcional: 'Descripción (opcional)', guardarGasto: 'Guardar gasto', fechaGasto: 'Fecha del gasto',
    buscarGasto: 'Buscar gasto...', filtros: 'Filtros', todas: 'Todas', rangoFechas: 'Rango de fechas', desde: 'Desde', hasta: 'Hasta',
    minimo: 'Mínimo', maximo: 'Máximo', ordenarPor: 'Ordenar por', fecha: 'Fecha', limpiar: 'Limpiar', elegirFecha: 'Elegir fecha',
    gastoPorCategoria: 'Gasto por categoría', totalRango: 'Total del rango', elegir: 'Elegir', cancelar: 'Cancelar', presupuestoGeneral: 'Presupuesto general',
    mensual: 'Mensual', semanal: 'Semanal', diario: 'Diario', anadirCategoria: '+ Añadir categoría', guardarPresupuesto: 'Guardar presupuesto',
    nuevaCategoria: 'Nueva categoría', crear: 'Crear', eliminarGasto: 'Eliminar gasto', eliminarCategoria: 'Eliminar categoría', listo: 'Listo',
    presupuestoGuardado: 'Presupuesto guardado', configurandoPara: 'Configurando para el', cerrarSesion: 'Cerrar sesión', eliminarCuenta: 'Eliminar cuenta', confirmarEliminarCuenta: 'Esta acción eliminará tu cuenta y todos tus datos. ¿Quieres continuar?', olvidoContrasena: '¿Olvidaste tu contraseña?', correoRecuperacionEnviado: 'Te enviamos un correo para recuperar tu contraseña.', informacionCuenta: 'Información de la cuenta', nombre: 'Nombre', correo: 'Correo', identificador: 'Identificador',
  },
  en: {
    inicio: 'Home', presupuesto: 'Budget', gastos: 'Expenses', resumen: 'Summary', ajustes: 'Settings', registrarGasto: 'Add expense',
    hola: 'Hello, Matias', gastadoEsteMes: 'Spent this month', gastadoEseDia: 'Spent that day', gastadoEstaSemana: 'Spent this week', presupuestados: 'budgeted',
    porCategoria: 'By category', dia: 'Day', semana: 'Week', mes: 'Month', ultimosGastos: 'Recent expenses', eseDia: 'That day',
    agregarGasto: 'Add expense', monto: 'Amount', descripcionOpcional: 'Description (optional)', guardarGasto: 'Save expense', fechaGasto: 'Expense date',
    buscarGasto: 'Search expense...', filtros: 'Filters', todas: 'All', rangoFechas: 'Date range', desde: 'From', hasta: 'To',
    minimo: 'Minimum', maximo: 'Maximum', ordenarPor: 'Sort by', fecha: 'Date', limpiar: 'Clear', elegirFecha: 'Choose date',
    gastoPorCategoria: 'Spending by category', totalRango: 'Range total', elegir: 'Choose', cancelar: 'Cancel', presupuestoGeneral: 'General budget',
    mensual: 'Monthly', semanal: 'Weekly', diario: 'Daily', anadirCategoria: '+ Add category', guardarPresupuesto: 'Save budget',
    nuevaCategoria: 'New category', crear: 'Create', eliminarGasto: 'Delete expense', eliminarCategoria: 'Delete category', listo: 'Done',
    presupuestoGuardado: 'Budget saved', configurandoPara: 'Setting up for', cerrarSesion: 'Sign out', eliminarCuenta: 'Delete account', confirmarEliminarCuenta: 'This will delete your account and all your data. Do you want to continue?', olvidoContrasena: 'Forgot your password?', correoRecuperacionEnviado: 'We sent you an email to recover your password.', informacionCuenta: 'Account information', nombre: 'Name', correo: 'Email', identificador: 'User ID',
  },
};

export function traducir(idioma: Idioma, clave: ClaveTraduccion): string {
  return traducciones[idioma][clave];
}
