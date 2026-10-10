import { listCopy } from './listCopy'

type ColumnId = keyof typeof listCopy.columns

export interface TableColumn {
  id: ColumnId
  header: string
  // Numbers to scan and compare: right-aligned, mono, tabular.
  numeric: boolean
  // Right-aligned without being a number: the actions.
  alignEnd?: boolean
}

// The wireframe's columns, in order. The table and its skeleton are both built
// from this list, so they always have the same shape. The last column holds
// the row actions.
export const tableColumns: TableColumn[] = [
  { id: 'product', header: listCopy.columns.product, numeric: false },
  { id: 'category', header: listCopy.columns.category, numeric: false },
  { id: 'price', header: listCopy.columns.price, numeric: true },
  { id: 'stock', header: listCopy.columns.stock, numeric: true },
  { id: 'status', header: listCopy.columns.status, numeric: false },
  { id: 'actions', header: listCopy.columns.actions, numeric: false, alignEnd: true },
]
