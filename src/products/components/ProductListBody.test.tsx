import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ListView } from '../model/productList'
import { ProductListBody } from './ProductListBody'

const meta = { page: 1, limit: 20, total: 1, totalPages: 1 }
const row = {
  productId: 'p-1',
  name: 'Wireless mouse',
  price: 'COP 1.234,56',
  stock: 7,
  category: 'Peripherals',
  active: true,
}

function renderBody(view: ListView) {
  const onRetry = vi.fn()
  const onPageChange = vi.fn()
  render(<ProductListBody view={view} onRetry={onRetry} onPageChange={onPageChange} />)
  return { onRetry, onPageChange }
}

describe('ProductListBody', () => {
  it('shows a loading notice while the products load', () => {
    renderBody({ status: 'loading' })

    expect(screen.getByRole('status')).toHaveTextContent('Loading products…')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows the error with a retry that repeats the request', async () => {
    const user = userEvent.setup()
    const { onRetry } = renderBody({ status: 'error' })

    expect(screen.getByRole('alert')).toHaveTextContent('The products could not be loaded.')
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('makes the retry reachable with the keyboard', async () => {
    const user = userEvent.setup()
    renderBody({ status: 'error' })

    await user.tab()

    expect(screen.getByRole('button', { name: 'Retry' })).toHaveFocus()
  })

  it('shows an empty notice when no product matches', () => {
    renderBody({ status: 'empty', meta: { ...meta, total: 0, totalPages: 0 } })

    expect(screen.getByText('No products match these filters.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows the products and their pagination when there is data', () => {
    renderBody({ status: 'data', rows: [row], meta })

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Wireless mouse' })).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
  })
})
