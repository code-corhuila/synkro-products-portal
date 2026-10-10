import { toProductRow, type ProductResponse } from './product'

const product: ProductResponse = {
  productId: '6f1c3c2a-8d4e-4b7a-9e21-3a5b7c9d1e00',
  name: 'Wireless mouse',
  priceCents: 123_456,
  stock: 7,
  categoryId: 'a1b2c3d4-0000-4000-8000-000000000001',
  active: true,
}

describe('toProductRow', () => {
  it('maps every column of the table', () => {
    const row = toProductRow(product, () => 'Peripherals')

    expect(row).toEqual({
      productId: '6f1c3c2a-8d4e-4b7a-9e21-3a5b7c9d1e00',
      name: 'Wireless mouse',
      price: 'COP 1.234,56',
      stock: 7,
      category: 'Peripherals',
      active: true,
    })
  })

  it("asks for the label of the product's categoryId", () => {
    const labelFor = vi.fn(() => 'Peripherals')

    toProductRow(product, labelFor)

    expect(labelFor).toHaveBeenCalledExactlyOnceWith(product.categoryId)
  })

  it('keeps an inactive product inactive', () => {
    const row = toProductRow({ ...product, active: false }, () => 'Peripherals')

    expect(row.active).toBe(false)
  })
})
