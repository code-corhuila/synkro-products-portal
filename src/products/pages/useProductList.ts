import { useCallback, useState } from 'react'
import { listProducts } from '../api/productsApi'
import type { FilterChange, ProductFilters } from '../model/product'
import { useLoad } from './useLoad'

const FIRST_PAGE_WITHOUT_FILTERS: ProductFilters = { page: 1 }

const loadProducts = (filters: ProductFilters, signal: AbortSignal) => listProducts(filters, { signal })

// The product list screen's state: the filters and page, and the answer for them.
// The filters stay when a request fails, so a retry asks the same question again.
export function useProductList() {
  const [filters, setFilters] = useState<ProductFilters>(FIRST_PAGE_WITHOUT_FILTERS)
  const { state, retry } = useLoad(filters, loadProducts)

  const updateFilters = useCallback((change: FilterChange) => {
    setFilters((current) => ({ ...current, ...change, page: 1 }))
  }, [])

  const goToPage = useCallback((page: number) => {
    setFilters((current) => ({ ...current, page }))
  }, [])

  return { state, filters, updateFilters, goToPage, retry }
}
