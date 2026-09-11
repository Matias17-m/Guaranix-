import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type ModoTema = 'oscuro' | 'claro';
export type Idioma = 'es' | 'en';

interface ColoresTema {
  fondo: string;
  superficie: string;
  superficieAlterna: string;
  texto: string;
  textoSecundario: string;
  borde: string;
  campo: string;
  textoCampo: string;
  modal: string;
  fondoModal: string;
}

export const coloresTema: Record<ModoTema, ColoresTema> = {
  oscuro: {
    fondo: '#101010',
    superficie: '#1A1A1A',
    superficieAlterna: '#181818',
    texto: '#FFFFFF',
    textoSecundario: '#B0B0B0',
    borde: '#2A2A2A',
    campo: '#101010',
    textoCampo: '#FFFFFF',
    modal: '#1A1A1A',
    fondoModal: 'rgba(0,0,0,0.65)',
  },
  claro: {
    fondo: '#F4F1EA',
    superficie: '#FFFFFF',
    superficieAlterna: '#FAF8F3',
    texto: '#202020',
    textoSecundario: '#6E6A62',
    borde: '#D8D1C4',
    campo: '#FFFFFF',
    textoCampo: '#202020',
    modal: '#FFFFFF',
    fondoModal: 'rgba(25,22,18,0.45)',
  },
};

interface EstadoTema {
  modo: ModoTema;
  idioma: Idioma;
  cargando: boolean;
  inicializar: () => Promise<void>;
  alternarModo: () => void;
  cambiarIdioma: (idioma: Idioma) => void;
}

async function guardarPreferencia(clave: string, valor: string) {
  try {
    await SecureStore.setItemAsync(clave, valor);
  } catch {
    // La app conserva la preferencia en memoria si el dispositivo no ofrece SecureStore.
  }
}

export const usarTema = create<EstadoTema>((set) => ({
  modo: 'oscuro',
  idioma: 'es',
  cargando: true,
  inicializar: async () => {
    try {
      const [modoGuardado, idiomaGuardado] = await Promise.all([
        SecureStore.getItemAsync('guaranix_modo'),
        SecureStore.getItemAsync('guaranix_idioma'),
      ]);
      set({
        modo: modoGuardado === 'claro' ? 'claro' : 'oscuro',
        idioma: idiomaGuardado === 'en' ? 'en' : 'es',
        cargando: false,
      });
    } catch {
      set({ cargando: false });
    }
  },
  alternarModo: () => set((estado) => {
    const modo = estado.modo === 'oscuro' ? 'claro' : 'oscuro';
    void guardarPreferencia('guaranix_modo', modo);
    return { modo };
  }),
  cambiarIdioma: (idioma) => {
    void guardarPreferencia('guaranix_idioma', idioma);
    set({ idioma });
  },
}));
