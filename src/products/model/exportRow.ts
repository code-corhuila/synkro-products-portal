import type { CategoryResponse } from './category'
import { listCopy } from './listCopy'
import type { ProductResponse } from './product'

// One row of the catalogue's Excel download, already resolved to its display
// form. `productId` is the contract's only identifier for a product (there is
// no separate SKU field), so it fills the product-reference column. Price is converted
// from integer minor-unit cents to a decimal amount: a spreadsheet cell holds
// the amount a person reads, not the minor-unit integer the API carries.
export interface ProductExportRow {
  sku: string
  name: string
  category: string
  price: number
  stock: number
}

// A lookup from a loaded categories list, with the same "unknown" fallback the
// catalogue table already uses for an id the list does not contain.
export function categoryLabelsFor(categories: CategoryResponse[]): (categoryId: string) => string {
  const names = new Map(categories.map((category) => [category.categoryId, category.name]))
  return (categoryId) => names.get(categoryId) ?? listCopy.categoryLabel.unknown
}

export function toExportRow(product: ProductResponse, categoryLabel: (categoryId: string) => string): ProductExportRow {
  if (!Number.isSafeInteger(product.priceCents) || Math.abs(product.priceCents) > 999_999_999_999_999
    || !Number.isSafeInteger(product.stock) || Math.abs(product.stock) > 999_999_999_999_999) {
    throw new Error('A catalogue amount exceeds Excel precision')
  }
  return {
    sku: product.productId,
    name: product.name,
    category: categoryLabel(product.categoryId),
    price: product.priceCents / 100,
    stock: product.stock,
  }
}
