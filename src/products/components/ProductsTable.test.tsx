import { render, screen, within } from '@testing-library/react'
import type { ProductRow } from '../model/product'
import { ProductsTable } from './ProductsTable'

const mouseRow: ProductRow = {
  productId: 'p-1',
  name: 'Wireless mouse',
  price: 'COP 1.234,56',
  stock: 7,
  category: 'Peripherals',
  active: true,
}

const keyboardRow: ProductRow = {
  productId: 'p-2',
  name: 'Mechanical keyboard',
  price: 'COP 0,00',
  stock: 0,
  category: 'Unknown category',
  active: false,
}

describe('ProductsTable', () => {
  it('has a column for each field of the list', () => {
    render(<ProductsTable rows={[mouseRow]} />)

    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent)
    expect(headers).toEqual(['Name', 'Price', 'Stock', 'Category', 'Status'])
  })

  it('shows every column of each product', () => {
    render(<ProductsTable rows={[mouseRow]} />)

    const row = screen.getByRole('row', { name: /Wireless mouse/ })
    const cells = within(row).getAllByRole('cell').map((cell) => cell.textContent)
    expect(cells).toEqual(['Wireless mouse', 'COP 1.234,56', '7', 'Peripherals', 'Active'])
  })

  it('shows an inactive product as Inactive', () => {
    render(<ProductsTable rows={[keyboardRow]} />)

    expect(screen.getByRole('cell', { name: 'Inactive' })).toBeInTheDocument()
  })

  it('keeps the rows in the order received', () => {
    render(<ProductsTable rows={[keyboardRow, mouseRow]} />)

    const names = screen.getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[0].textContent)
    expect(names).toEqual(['Mechanical keyboard', 'Wireless mouse'])
  })
})
