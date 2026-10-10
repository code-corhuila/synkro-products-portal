// Everything the product list says to the user, in Spanish. Code, tests and
// comments stay in English; only these strings are user-facing.
export const listCopy = {
  loading: 'Cargando productos…',

  tiles: {
    activeProducts: 'Productos activos',
    outOfStock: 'Agotados',
    activeCategories: 'Categorías activas',
  },

  tableRegion: 'Tabla de productos',
  columns: {
    product: 'Producto',
    category: 'Categoría',
    price: 'Precio',
    stock: 'Stock',
    status: 'Estado',
  },
  stock: {
    'in-stock': 'En stock',
    'out-of-stock': 'Agotado',
  },
  status: {
    active: 'Activo',
    inactive: 'Inactivo',
  },
  categoryLabel: {
    loading: 'Cargando…',
    unavailable: 'No disponible',
    unknown: 'Categoría desconocida',
  },
} as const
