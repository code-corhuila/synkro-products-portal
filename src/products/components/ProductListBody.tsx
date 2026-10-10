import { listCopy } from '../model/listCopy'
import type { ListView } from '../model/productList'
import { ListEmpty } from './ListEmpty'
import { ListError } from './ListError'
import { Pagination } from './Pagination'
import styles from './ProductListBody.module.css'
import { ProductsTable } from './ProductsTable'
import { ProductsTableSkeleton } from './ProductsTableSkeleton'
import type { RowActionHandlers } from './RowActions'

interface ProductListBodyProps {
  view: ListView
  // What the row actions do; undefined when the rows offer none.
  actions?: RowActionHandlers
  onRetry: () => void
  onPageChange: (page: number) => void
  // Opens the registration form from the empty state; undefined while it cannot open.
  onRegister: (() => void) | undefined
}

// The four states of the list: loading, error with retry, empty, and data.
export function ProductListBody({ view, actions, onRetry, onPageChange, onRegister }: ProductListBodyProps) {
  switch (view.status) {
    case 'loading':
      return (
        <>
          <p role="status" className={styles.visuallyHidden}>
            {listCopy.loading}
          </p>
          <ProductsTableSkeleton />
        </>
      )

    case 'error':
      return <ListError onRetry={onRetry} />

    case 'empty':
      return (
        <>
          <ListEmpty hasFilters={view.hasFilters} onRegister={onRegister} />
          {view.meta.totalPages > 0 && <Pagination meta={view.meta} onPageChange={onPageChange} />}
        </>
      )

    case 'data':
      return (
        <>
          <ProductsTable rows={view.rows} actions={actions} />
          <Pagination meta={view.meta} onPageChange={onPageChange} />
        </>
      )
  }
}
