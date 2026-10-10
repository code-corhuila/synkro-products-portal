import type { CategoryResponse } from './category'
import { listCopy } from './listCopy'
import type { Loadable } from './loadable'

export type SummaryTileId = 'activeProducts' | 'outOfStock' | 'activeCategories'

// One stat tile of the list: its label and the state of its own request.
export interface SummaryTile {
  id: SummaryTileId
  label: string
  state: Loadable<number>
}

// The categories are the ones the page already loads for the filter and the
// registration form, so this tile costs no request of its own.
export function countActiveCategories(categories: Loadable<CategoryResponse[]>): Loadable<number> {
  if (categories.status !== 'ready') return categories
  return { status: 'ready', value: categories.value.filter((category) => category.active).length }
}

// The wireframe's three tiles, in order. Each one keeps its own state, so one
// failing never changes the others.
export function toSummaryTiles(
  activeProducts: Loadable<number>,
  outOfStock: Loadable<number>,
  categories: Loadable<CategoryResponse[]>,
): SummaryTile[] {
  return [
    { id: 'activeProducts', label: listCopy.tiles.activeProducts, state: activeProducts },
    { id: 'outOfStock', label: listCopy.tiles.outOfStock, state: outOfStock },
    { id: 'activeCategories', label: listCopy.tiles.activeCategories, state: countActiveCategories(categories) },
  ]
}
