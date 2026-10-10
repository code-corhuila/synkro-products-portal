// Pagination shape of every list in the products API (_shared.yaml, PageMeta).
export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Page<T> {
  data: T[]
  meta: PageMeta
}
