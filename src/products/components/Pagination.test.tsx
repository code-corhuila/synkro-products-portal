import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

const meta = (page: number, totalPages: number) => ({ page, limit: 20, total: 100, totalPages })

describe('Pagination', () => {
  it('shows the current page out of the total', () => {
    render(<Pagination meta={meta(2, 5)} onPageChange={vi.fn()} />)

    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument()
  })

  it('moves to the previous and next page', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination meta={meta(2, 5)} onPageChange={onPageChange} />)

    await user.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(1)

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(3)
  })

  it('disables Previous on the first page', () => {
    render(<Pagination meta={meta(1, 5)} onPageChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()
  })

  it('disables Next on the last page', () => {
    render(<Pagination meta={meta(5, 5)} onPageChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled()
  })

  it('is labelled as the pagination of the list', () => {
    render(<Pagination meta={meta(1, 3)} onPageChange={vi.fn()} />)

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
  })
})
