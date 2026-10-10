import type { ListView } from '../model/productList'
import { Pagination } from './Pagination'
import { ProductsTable } from './ProductsTable'

interface ProductListBodyProps {
  view: ListView
  onRetry: () => void
  onPageChange: (page: number) => void
}

// The four states of the list: loading, error with retry, empty, and data.
export function ProductListBody({ view, onRetry, onPageChange }: ProductListBodyProps) {
  switch (view.status) {
    case 'loading':
      return <p role="status">Loading products…</p>

    case 'error':
      return (
        <div role="alert">
          <p>The products could not be loaded.</p>
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        </div>
      )

    case 'empty':
      return (
        <>
          <p>No products match these filters.</p>
          {view.meta.totalPages > 0 && <Pagination meta={view.meta} onPageChange={onPageChange} />}
        </>
      )

    case 'data':
      return (
        <>
          <ProductsTable rows={view.rows} />
          <Pagination meta={view.meta} onPageChange={onPageChange} />
        </>
      )
  }
}
