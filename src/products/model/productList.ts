import type { CategoryResponse } from './category'
import type { Loadable } from './loadable'
import type { Page, PageMeta } from './page'
import { toProductRow, type ProductResponse, type ProductRow } from './product'

// What the list body shows. The four states of the screen, per the frontend guide.
export type ListView =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'empty'; meta: PageMeta }
  | { status: 'data'; rows: ProductRow[]; meta: PageMeta }

const UNKNOWN_CATEGORY = 'Unknown category'

// Products and categories are separate requests, so the table keeps showing
// its rows while the categories load or after they failed.
export function toListView(
  products: Loadable<Page<ProductResponse>>,
  categories: Loadable<CategoryResponse[]>,
): ListView {
  if (products.status === 'loading') return { status: 'loading' }
  if (products.status === 'error') return { status: 'error' }

  const { data, meta } = products.value
  if (data.length === 0) return { status: 'empty', meta }

  const categoryLabel = labelForCategories(categories)
  return { status: 'data', rows: data.map((product) => toProductRow(product, categoryLabel)), meta }
}

function labelForCategories(categories: Loadable<CategoryResponse[]>): (categoryId: string) => string {
  switch (categories.status) {
    case 'loading':
      return () => 'Loading…'
    case 'error':
      return () => 'Unavailable'
    case 'ready': {
      const names = new Map(categories.value.map((category) => [category.categoryId, category.name]))
      return (categoryId) => names.get(categoryId) ?? UNKNOWN_CATEGORY
    }
  }
}
