import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/configuracion/supabase';
import { usarAlmacenGastos } from '@/almacen/usarAlmacenGastos';

interface EstadoSesion {
  usuario: User | null;
  sesion: Session | null;
  cargando: boolean;
  error: string | null;
  recuperandoContrasena: boolean;
  inicializar: () => Promise<() => void>;
  iniciarSesion: (correo: string, contrasena: string) => Promise<boolean>;
  registrarse: (nombre: string, correo: string, contrasena: string) => Promise<boolean>;
  solicitarRecuperacion: (correo: string) => Promise<boolean>;
  actualizarContrasena: (contrasena: string) => Promise<boolean>;
  cancelarRecuperacion: () => void;
  cerrarSesion: () => Promise<void>;
  eliminarCuenta: () => Promise<boolean>;
  limpiarError: () => void;
}

function obtenerMensajeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return 'Ocurrió un error. Intenta nuevamente.';
}

export const usarSesion = create<EstadoSesion>((set) => ({
  usuario: null,
  sesion: null,
  cargando: true,
  error: null,
  recuperandoContrasena: false,

  inicializar: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) set({ error: obtenerMensajeError(error) });
    let sesionValida = data.session;
    if (sesionValida) {
      const respuestaUsuario = await supabase.auth.getUser();
      if (respuestaUsuario.error || !respuestaUsuario.data.user) {
        await supabase.auth.signOut({ scope: 'local' });
        sesionValida = null;
      }
    }
    set({ sesion: sesionValida, usuario: sesionValida?.user ?? null, cargando: false });

    const { data: listener } = supabase.auth.onAuthStateChange((evento, sesion) => {
      set({ sesion, usuario: sesion?.user ?? null, cargando: false, recuperandoContrasena: evento === 'PASSWORD_RECOVERY' });
    });

    return () => listener.subscription.unsubscribe();
  },

  iniciarSesion: async (correo, contrasena) => {
    set({ cargando: true, error: null });
    usarAlmacenGastos.getState().limpiarDatos();
    const { data, error } = await supabase.auth.signInWithPassword({ email: correo.trim(), password: contrasena });
    if (error) {
      set({ cargando: false, error: obtenerMensajeError(error) });
      return false;
    }
    set({ sesion: data.session, usuario: data.user, cargando: false });
    return true;
  },

  registrarse: async (nombre, correo, contrasena) => {
    set({ cargando: true, error: null });
    usarAlmacenGastos.getState().limpiarDatos();
    const { data, error } = await supabase.auth.signUp({
      email: correo.trim(),
      password: contrasena,
      options: { data: { nombre: nombre.trim() } },
    });
    if (error) {
      set({ cargando: false, error: obtenerMensajeError(error) });
      return false;
    }
    set({ sesion: data.session, usuario: data.user, cargando: false });
    return true;
  },

  solicitarRecuperacion: async (correo) => {
    set({ cargando: true, error: null });
    const { error } = await supabase.auth.resetPasswordForEmail(correo.trim(), {
      redirectTo: 'guaranix://reset-password',
    });
    if (error) {
      set({ cargando: false, error: obtenerMensajeError(error) });
      return false;
    }
    set({ cargando: false });
    return true;
  },

  actualizarContrasena: async (contrasena) => {
    set({ cargando: true, error: null });
    const { error } = await supabase.auth.updateUser({ password: contrasena });
    if (error) {
      set({ cargando: false, error: obtenerMensajeError(error) });
      return false;
    }
    set({ cargando: false, recuperandoContrasena: false });
    return true;
  },

  cancelarRecuperacion: () => set({ recuperandoContrasena: false, error: null }),

  cerrarSesion: async () => {
    await supabase.auth.signOut({ scope: 'local' });
    usarAlmacenGastos.getState().limpiarDatos();
    set({ sesion: null, usuario: null, error: null, recuperandoContrasena: false });
  },

  eliminarCuenta: async () => {
    set({ cargando: true, error: null });
    const { error } = await supabase.rpc('eliminar_mi_cuenta');
    if (error) {
      set({ cargando: false, error: obtenerMensajeError(error) });
      return false;
    }
    await supabase.auth.signOut({ scope: 'local' });
    usarAlmacenGastos.getState().limpiarDatos();
    set({ sesion: null, usuario: null, cargando: false, error: null, recuperandoContrasena: false });
    return true;
  },

  limpiarError: () => set({ error: null }),
}));
