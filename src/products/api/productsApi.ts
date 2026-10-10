import { apiClient } from 'shell/apiClient'
import type { CategoryResponse } from '../model/category'
import type { Page } from '../model/page'
import type { ProductFilters, ProductResponse } from '../model/product'

const PRODUCTS_PATH = '/api/v1/products'
const CATEGORIES_PATH = '/api/v1/products/categories'
const PRODUCTS_PAGE_SIZE = 20
const CATEGORIES_PAGE_SIZE = 100

export interface CategoryListQuery {
  page: number
  limit: number
  active?: boolean
}

interface ListOptions {
  signal?: AbortSignal
}

// Every call goes through the host's single client, which adds the gateway
// address, credential, correlation id and timeout. The caller passes a signal
// so a superseded request can be aborted.
export function listProducts(filters: ProductFilters, options: ListOptions = {}): Promise<Page<ProductResponse>> {
  return apiClient.request<Page<ProductResponse>>(PRODUCTS_PATH, {
    query: productQuery(filters),
    signal: options.signal,
  })
}

export function listCategories(query: CategoryListQuery, options: ListOptions = {}): Promise<Page<CategoryResponse>> {
  return apiClient.request<Page<CategoryResponse>>(CATEGORIES_PATH, {
    query: { ...query },
    signal: options.signal,
  })
}

// The categories list is needed to name each product's category and to fill the
// category filter. Reads every page, so no category is missing from the map.
export async function listAllCategories(options: ListOptions = {}): Promise<CategoryResponse[]> {
  const categories: CategoryResponse[] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const response = await listCategories({ page, limit: CATEGORIES_PAGE_SIZE }, options)
    categories.push(...response.data)
    totalPages = response.meta.totalPages
    page += 1
  }

  return categories
}

// A value the host skips when undefined: an unset or blank filter is left out.
function productQuery({ page, name, categoryId, active }: ProductFilters) {
  return {
    page,
    limit: PRODUCTS_PAGE_SIZE,
    name: textOrUndefined(name),
    categoryId: textOrUndefined(categoryId),
    active,
  }
}

function textOrUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}
