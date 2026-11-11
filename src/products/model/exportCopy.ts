// Everything the catalogue's Excel download says to the user, in Spanish.
// Code, tests and comments stay in English; only these strings are user-facing.
export const exportCopy = {
  action: 'Descargar Excel',
  pending: 'Generando archivo…',
  onlyInStock: 'Solo con existencias',
  success: 'Catálogo descargado',

  sheetName: 'Catálogo',
  // No accents: this is a file-system name, not a label.
  fileName: 'catalogo-productos',
  columns: {
    sku: 'Referencia de producto',
    name: 'Nombre',
    category: 'Categoría',
    price: 'Precio',
    stock: 'Stock',
  },

  tooLarge: 'Hay demasiados productos para exportar. Aplica más filtros e inténtalo de nuevo.',
  failed: {
    authentication: 'La sesión ha finalizado. Vuelve a iniciar sesión desde SynkroTech.',
    authorization: 'No tienes permiso para descargar el catálogo.',
    network: 'No se pudo conectar con el servidor. Inténtalo de nuevo.',
    other: 'No se pudo generar el archivo. Inténtalo de nuevo.',
  },
} as const
