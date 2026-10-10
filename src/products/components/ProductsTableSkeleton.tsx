import { tableColumns, type TableColumn } from '../model/tableColumns'
import styles from './ProductsTable.module.css'
import { ProductsTableHead } from './ProductsTableHead'
import { Skeleton } from './Skeleton'

const SKELETON_ROWS = 8
const BADGE_COLUMNS = ['category', 'status']

// The loading shape of the table: the same columns and headers, with a
// placeholder in every cell. It is hidden from screen readers, which hear the
// loading status instead, and it takes no focus.
export function ProductsTableSkeleton() {
  return (
    <div aria-hidden="true" className={styles.scroller}>
      <table className={styles.table}>
        <ProductsTableHead />
        <tbody>
          {Array.from({ length: SKELETON_ROWS }, (_, row) => (
            <tr key={row}>
              {tableColumns.map((column) => (
                <td key={column.id} className={cellClass(column)}>
                  <Skeleton shape={BADGE_COLUMNS.includes(column.id) ? 'badge' : 'text'} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function cellClass({ numeric, alignEnd }: TableColumn): string | undefined {
  if (numeric) return styles.numeric
  return alignEnd ? styles.actionsCell : undefined
}
