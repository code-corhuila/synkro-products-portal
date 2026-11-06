import { listProducts } from './productsApi'
import type { ProductFilters, ProductResponse } from '../model/product'

// 20 products a page (the catalogue's own page size) times this many pages:
// an explicit, documented bound, not a silent truncation. An export this
// large should narrow its filters instead of growing without bound.
export const EXPORT_MAX_PAGES = 50

export class ExportTooLargeError extends Error {
  constructor() {
    super('Too many products match the current filters to export')
  }
}

interface ExportOptions {
  signal?: AbortSignal
}

// Every product that matches the catalogue's current filters, read page by
// page through the host's client, the same shape `listAllCategories` and
// `listAllOpenAlerts` already use. A page that fails fails the whole export:
// a partial workbook would misreport the catalogue, so nothing is returned
// until every page has answered. The read stops, with no further request,
// once the first page's `meta.totalPages` exceeds `EXPORT_MAX_PAGES`.
export async function listAllMatchingProducts(
  filters: ProductFilters,
  options: ExportOptions = {},
): Promise<ProductResponse[]> {
  const products: ProductResponse[] = []
  const seen = new Set<string>()
  let page = 1
  let totalPages = 1
  let expectedTotal: number | undefined

  while (page <= totalPages) {
    const response = await listProducts({ ...filters, page }, options)
    if (response.meta.totalPages > EXPORT_MAX_PAGES || response.meta.total > EXPORT_MAX_PAGES * 20) {
      throw new ExportTooLargeError()
    }
    if (response.meta.page !== page
      || (expectedTotal !== undefined && (response.meta.total !== expectedTotal || response.meta.totalPages !== totalPages))) {
      throw new Error('Catalogue changed during export')
    }
    expectedTotal = response.meta.total
    for (const product of response.data) {
      if (seen.has(product.productId)) throw new Error('Catalogue changed during export')
      seen.add(product.productId)
      products.push(product)
    }
    totalPages = response.meta.totalPages
    page += 1
  }
  if (products.length !== expectedTotal) throw new Error('Catalogue changed during export')

  return products
}
