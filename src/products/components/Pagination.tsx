import type { PageMeta } from '../model/page'

interface PaginationProps {
  meta: PageMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  return (
    <nav aria-label="Pagination">
      <button type="button" onClick={() => onPageChange(meta.page - 1)} disabled={meta.page <= 1}>
        Previous page
      </button>
      <span>
        Page {meta.page} of {meta.totalPages}
      </span>
      <button type="button" onClick={() => onPageChange(meta.page + 1)} disabled={meta.page >= meta.totalPages}>
        Next page
      </button>
    </nav>
  )
}
