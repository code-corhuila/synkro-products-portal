import { ProductFilterBar } from '../components/ProductFilterBar'
import { ProductListBody } from '../components/ProductListBody'
import { toListView } from '../model/productList'
import { useCategories } from './useCategories'
import { useProductList } from './useProductList'

// The product catalogue list. Products and categories load independently: the
// table keeps its rows when the categories fail, and the filter offers a retry.
export function ProductsPage() {
  const products = useProductList()
  const categories = useCategories()
  const view = toListView(products.state, categories.state)

  return (
    <section>
      <h1>Products</h1>
      <ProductFilterBar
        filters={products.filters}
        categories={categories.state}
        onChange={products.updateFilters}
        onRetryCategories={categories.retry}
      />
      <ProductListBody view={view} onRetry={products.retry} onPageChange={products.goToPage} />
    </section>
  )
}
