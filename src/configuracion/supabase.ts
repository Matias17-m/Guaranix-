import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en el archivo .env',
  );
}

const memoriaSesion = new Map<string, string>();

const almacenamientoSesion = {
  getItem: async (clave: string): Promise<string | null> => {
    if (Platform.OS === 'web') return globalThis.localStorage?.getItem(clave) ?? null;
    try {
      return await SecureStore.getItemAsync(clave);
    } catch {
      return memoriaSesion.get(clave) ?? null;
    }
  },
  setItem: async (clave: string, valor: string): Promise<void> => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(clave, valor);
      return;
    }
    try {
      await SecureStore.setItemAsync(clave, valor);
    } catch {
      memoriaSesion.set(clave, valor);
    }
  },
  removeItem: async (clave: string): Promise<void> => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(clave);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(clave);
    } catch {
      memoriaSesion.delete(clave);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: almacenamientoSesion,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
