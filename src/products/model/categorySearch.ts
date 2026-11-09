import type { CategoryResponse } from './category'

// How many options the list renders at once. The rest stay reachable by typing.
export const MAX_VISIBLE_CATEGORIES = 50

const fold = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es')

export interface CategoryMatches {
  shown: CategoryResponse[]
  // Every category that matches, before the display bound.
  total: number
}

// Case- and accent-insensitive search over the whole list, ordered by name. Inactive categories are
// never offered: they cannot receive a product.
export function filterCategories(categories: readonly CategoryResponse[], term: string): CategoryMatches {
  const needle = fold(term.trim())
  const matches = categories
    .filter((category) => category.active && fold(category.name).includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
  return { shown: matches.slice(0, MAX_VISIBLE_CATEGORIES), total: matches.length }
}
