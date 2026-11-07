import { useEffect, useRef, useState } from 'react'
import { ExportTooLargeError, listAllMatchingProducts } from '../api/exportProducts'
import { downloadBlob } from '../export/downloadBlob'
import { buildCatalogueWorkbook } from '../export/workbook'
import type { CategoryResponse } from '../model/category'
import { exportCopy } from '../model/exportCopy'
import { categoryLabelsFor, toExportRow } from '../model/exportRow'
import type { ProductFilters } from '../model/product'
import { Button } from './Button'

export function CatalogueExport({ filters, categories, disabled = false }: {
  filters: ProductFilters; categories: CategoryResponse[]; disabled?: boolean
}) {
  const request = useRef<AbortController | null>(null)
  const [onlyStock, setOnlyStock] = useState(false)
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  useEffect(() => () => request.current?.abort(), [])

  async function save() {
    if (disabled || request.current) return
    const controller = new AbortController()
    request.current = controller
    setPending(true)
    setError('')
    setStatus('')
    try {
      const rows = await listAllMatchingProducts(filters, { signal: controller.signal })
      if (controller.signal.aborted) return
      const categoryName = categoryLabelsFor(categories)
      const file = await buildCatalogueWorkbook(rows.filter((product) => !onlyStock || product.stock > 0)
        .map((product) => toExportRow(product, categoryName)))
      if (controller.signal.aborted) return
      downloadBlob(file, `${exportCopy.fileName}.xlsx`)
      setStatus(exportCopy.success)
    } catch (failure) {
      if (controller.signal.aborted) return
      const code = (failure as { status?: number } | undefined)?.status
      setError(failure instanceof ExportTooLargeError ? exportCopy.tooLarge
        : code === 401 ? exportCopy.failed.authentication
        : code === 403 ? exportCopy.failed.authorization
        : code === 0 ? exportCopy.failed.network : exportCopy.failed.other)
    } finally {
      request.current = null
      if (!controller.signal.aborted) setPending(false)
    }
  }

  return <div>
    <label><input type="checkbox" checked={onlyStock} disabled={pending || disabled}
      onChange={(event) => setOnlyStock(event.target.checked)} /> {exportCopy.onlyInStock}</label>{' '}
    <Button variant="secondary" disabled={pending || disabled} aria-busy={pending}
      onClick={() => void save()}>{exportCopy.action}</Button>
    <p aria-live="polite">{pending ? exportCopy.pending : status}</p>
    {error && <p role="alert">{error}</p>}
  </div>
}
