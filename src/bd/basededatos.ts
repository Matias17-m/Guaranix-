import * as SQLite from 'expo-sqlite';

const baseDeDatos = SQLite.openDatabaseSync('guaranix.db');

export function inicializarBaseDeDatos() {
  baseDeDatos.execSync(`
    CREATE TABLE IF NOT EXISTS categorias_gasto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      icono TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#E0B84B'
    );

    CREATE TABLE IF NOT EXISTS gastos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria_id INTEGER NOT NULL,
      descripcion TEXT,
      monto REAL NOT NULL,
      moneda TEXT NOT NULL DEFAULT 'PYG',
      fecha TEXT NOT NULL,
      creado_en TEXT NOT NULL,
      FOREIGN KEY (categoria_id) REFERENCES categorias_gasto (id)
    );

    CREATE TABLE IF NOT EXISTS ingresos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descripcion TEXT,
      monto REAL NOT NULL,
      moneda TEXT NOT NULL DEFAULT 'PYG',
      fecha TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS presupuesto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria_id INTEGER,
      monto_limite REAL NOT NULL,
      periodo TEXT NOT NULL DEFAULT 'mensual',
      mes_o_semana TEXT NOT NULL,
      FOREIGN KEY (categoria_id) REFERENCES categorias_gasto (id)
    );
  `);

  const columnasCategoria = baseDeDatos.getAllSync<{ name: string }>(
    'PRAGMA table_info(categorias_gasto)'
  );
  if (!columnasCategoria.some((columna) => columna.name === 'color')) {
    baseDeDatos.execSync("ALTER TABLE categorias_gasto ADD COLUMN color TEXT NOT NULL DEFAULT '#E0B84B'");
  }

  poblarCategoriasPorDefecto();
}

function poblarCategoriasPorDefecto() {
  const cantidad = baseDeDatos.getFirstSync<{ total: number }>(
    'SELECT COUNT(*) as total FROM categorias_gasto'
  );

  if (cantidad && cantidad.total === 0) {
    const categoriasIniciales = [
      { nombre: 'Comida', icono: 'silverware-fork-knife', color: '#E0B84B' },
      { nombre: 'Transporte', icono: 'bus', color: '#5DA9E9' },
      { nombre: 'Entretenimiento', icono: 'movie-open', color: '#C084FC' },
      { nombre: 'Servicios', icono: 'flash', color: '#5CC8A1' },
      { nombre: 'Otro', icono: 'dots-horizontal', color: '#E57A6D' },
    ];

    categoriasIniciales.forEach((categoria) => {
      baseDeDatos.runSync(
        'INSERT INTO categorias_gasto (nombre, icono, color) VALUES (?, ?, ?)',
        [categoria.nombre, categoria.icono, categoria.color]
      );
    });
  }

  const coloresPorNombre = [
    ['Comida', '#E0B84B'],
    ['Transporte', '#5DA9E9'],
    ['Entretenimiento', '#C084FC'],
    ['Servicios', '#5CC8A1'],
    ['Otro', '#E57A6D'],
  ];
  coloresPorNombre.forEach(([nombre, color]) => {
    baseDeDatos.runSync('UPDATE categorias_gasto SET color = ? WHERE nombre = ?', [color, nombre]);
  });
}

export default baseDeDatos;
