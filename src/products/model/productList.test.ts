import { keyboard, mouse, peripherals, productsPage } from '../../test-doubles/productsFixtures'
import type { Loadable } from './loadable'
import { toListView } from './productList'

const ready = <T>(value: T): Loadable<T> => ({ status: 'ready', value })
const loading: Loadable<never> = { status: 'loading' }
const failed: Loadable<never> = { status: 'error' }

describe('toListView', () => {
  it('is loading while the products are loading', () => {
    expect(toListView(loading, ready([peripherals]))).toEqual({ status: 'loading' })
  })

  it('is an error when the products failed', () => {
    expect(toListView(failed, ready([peripherals]))).toEqual({ status: 'error' })
  })

  it('is empty when the page has no products, keeping the page metadata', () => {
    const products = ready(productsPage([]))

    expect(toListView(products, ready([peripherals]))).toEqual({
      status: 'empty',
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    })
  })

  it('is data with one row per product, in the order received', () => {
    const view = toListView(ready(productsPage([mouse, keyboard])), ready([peripherals]))

    expect(view.status).toBe('data')
    if (view.status !== 'data') return
    expect(view.rows.map((row) => row.name)).toEqual(['Wireless mouse', 'Mechanical keyboard'])
    expect(view.rows[0]).toMatchObject({ price: 'COP 1.234,56', stock: 7, stockState: 'in-stock', category: 'Peripherals', active: true })
  })

  it('shows a category the loaded list does not know as "Categoría desconocida"', () => {
    const view = toListView(ready(productsPage([keyboard])), ready([peripherals]))

    expect(view.status === 'data' && view.rows[0].category).toBe('Categoría desconocida')
  })

  it('shows the category as loading while the categories are still loading', () => {
    const view = toListView(ready(productsPage([mouse])), loading)

    expect(view.status === 'data' && view.rows[0].category).toBe('Cargando…')
  })

  it('shows the category as unavailable when the categories failed, and still shows the products', () => {
    const view = toListView(ready(productsPage([mouse])), failed)

    expect(view.status === 'data' && view.rows[0]).toMatchObject({ name: 'Wireless mouse', category: 'No disponible' })
  })
})
