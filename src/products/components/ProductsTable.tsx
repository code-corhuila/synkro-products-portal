import { listCopy } from '../model/listCopy'
import type { ProductRow } from '../model/product'
import { Badge } from './Badge'
import styles from './ProductsTable.module.css'
import { ProductsTableHead } from './ProductsTableHead'

interface ProductsTableProps {
  rows: ProductRow[]
}

// The table scrolls inside its own region, so a narrow screen never scrolls the
// page sideways. The region takes the keyboard focus so the scroll is reachable.
export function ProductsTable({ rows }: ProductsTableProps) {
  return (
    <div role="region" aria-label={listCopy.tableRegion} tabIndex={0} className={styles.scroller}>
      <table className={styles.table}>
        <ProductsTableHead />
        <tbody>
          {rows.map((row) => (
            <ProductTableRow key={row.productId} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ProductTableRow({ row }: { row: ProductRow }) {
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
    </tr>
  )
}
