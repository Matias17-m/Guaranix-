# Guaranix

App móvil de control de gastos e ingresos semanales/mensuales, pensada para Paraguay (guaraníes ₲). Proyecto de facultad/portfolio.

## Stack

- React Native + Expo (TypeScript)
- expo-sqlite para persistencia local
- Zustand para estado global
- React Navigation (bottom tabs)
- react-native-gifted-charts para gráficos

## Cómo correr el proyecto

```bash
npm install
npm start
```

Luego escaneá el código QR con la app Expo Go, o presioná `a` (Android) / `i` (iOS) si tenés un emulador configurado.

## Estructura de carpetas

```
src/
  pantallas/      # Las 5 pantallas: Inicio, RegistrarGasto, Presupuesto, Gastos, Resumen
  componentes/     # Componentes reutilizables (aún vacío, para ir agregando)
  navegacion/      # Configuración de React Navigation (tab bar + botón flotante)
  bd/              # SQLite: esquema (basededatos.ts) y consultas (consultas.ts)
  almacen/         # Estado global con Zustand
  tipos/           # Tipos TypeScript compartidos
  utilidades/       # Funciones auxiliares (formato de moneda, fechas)
```

## Estado actual

- [x] Estructura del proyecto
- [x] Modelo de datos (categorías, gastos, ingresos, presupuesto)
- [x] Las 5 pantallas con datos reales conectados a SQLite
- [x] Navegación con tab bar y botón flotante
- [ ] Gráfico de tendencia semanal en Resumen (falta conectar react-native-gifted-charts)
- [ ] Guardado real del presupuesto por categoría
- [ ] Comparación con mes anterior en Resumen
- [ ] Registro de ingresos desde la UI
- [ ] Fase 2: módulo de patrimonio neto (assets/liabilities)
