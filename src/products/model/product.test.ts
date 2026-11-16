import { mouse } from '../../test-doubles/productsFixtures'
import { toProductRow } from './product'

describe('toProductRow', () => {
  it.each([5_000_000_000_000_000_000, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity, -1, 1.5])(
    'keeps the row usable without approximating an unrepresentable price %s', (priceCents) => {
      const row = toProductRow({ ...mouse, priceCents }, () => 'Peripherals')
      expect(row.price).toBe('Importe fuera del rango seguro')
      expect(row).toMatchObject({ name: mouse.name, stock: mouse.stock, active: mouse.active })
    },
  )
  it('maps every column of the table', () => {
    const row = toProductRow(mouse, () => 'Peripherals')

    expect(row).toEqual({
      productId: 'p-1',
      name: 'Wireless mouse',
      price: 'COP 1.234,56',
      stock: 7,
      stockState: 'in-stock',
      category: 'Peripherals',
      active: true,
    })
  })

  it("asks for the label of the product's categoryId", () => {
    const labelFor = vi.fn(() => 'Peripherals')

    toProductRow(mouse, labelFor)

    expect(labelFor).toHaveBeenCalledExactlyOnceWith('c-1')
  })

  it('keeps an inactive product inactive', () => {
    const row = toProductRow({ ...mouse, active: false }, () => 'Peripherals')

    expect(row.active).toBe(false)
  })
})
