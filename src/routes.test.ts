import { ProductsPage } from './products/pages/ProductsPage'
import { resolveScreen } from './routes'

describe('resolveScreen', () => {
  it('serves the products list at /products', () => {
    expect(resolveScreen('/products')?.type).toBe(ProductsPage)
  })

  it('serves the products list with a trailing slash', () => {
    expect(resolveScreen('/products/')?.type).toBe(ProductsPage)
  })

  it('serves nothing for the other screens the host mounts on this app', () => {
    expect(resolveScreen('/stock')).toBeNull()
    expect(resolveScreen('/stock-alerts')).toBeNull()
  })

  it('does not match a path that only starts with products', () => {
    expect(resolveScreen('/productsx')).toBeNull()
  })
})
