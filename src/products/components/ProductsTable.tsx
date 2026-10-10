import { listCopy } from '../model/listCopy'
import type { ProductRow } from '../model/product'
import { Badge } from './Badge'
import { RowActions, type RowActionHandlers } from './RowActions'
import styles from './ProductsTable.module.css'
import { ProductsTableHead } from './ProductsTableHead'

interface ProductsTableProps {
  rows: ProductRow[]
  // What the row actions do. Without it the rows offer none.
  actions?: RowActionHandlers
}

// The table scrolls inside its own region, so a narrow screen never scrolls the
// page sideways. The region takes the keyboard focus so the scroll is reachable,
// and it is where focus falls back to when the control that opened a panel is gone.
export function ProductsTable({ rows, actions }: ProductsTableProps) {
  return (
    <div
      role="region"
      aria-label={listCopy.tableRegion}
      tabIndex={0}
      data-focus-fallback="catalogue"
      className={styles.scroller}
    >
      <table className={styles.table}>
        <ProductsTableHead />
        <tbody>
          {rows.map((row) => (
            <ProductTableRow key={row.productId} row={row} actions={actions} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ProductTableRow({ row, actions }: { row: ProductRow; actions: RowActionHandlers | undefined }) {
  return (
    <tr>
      <td className={styles.name}>{row.name}</td>
      <td>
        <Badge tone="neutral" marker={false}>
          {row.category}
        </Badge>
      </td>
      <td className={styles.numeric}>{row.price}</td>
      <td className={styles.numeric}>
        <span className={styles.stock}>
          <Badge tone={row.stockState === 'in-stock' ? 'success' : 'error'}>{listCopy.stock[row.stockState]}</Badge>
          {row.stock}
        </span>
      </td>
      <td>
        <Badge tone={row.active ? 'success' : 'neutral'}>
          {row.active ? listCopy.status.active : listCopy.status.inactive}
        </Badge>
      </td>
      <td className={styles.actionsCell}>{actions && <RowActions row={row} handlers={actions} />}</td>
    </tr>
  )
}
