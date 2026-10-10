import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { accessories, peripherals } from '../../test-doubles/productsFixtures'
import { ProductFilterBar } from './ProductFilterBar'

type Props = ComponentProps<typeof ProductFilterBar>

function renderBar(overrides: Partial<Props> = {}) {
  const props: Props = {
    filters: { page: 1 },
    categories: { status: 'ready', value: [peripherals, accessories] },
    onChange: vi.fn(),
    onRetryCategories: vi.fn(),
    ...overrides,
  }
  render(<ProductFilterBar {...props} />)
  return props
}

describe('ProductFilterBar', () => {
  it('labels each filter and describes the name field', () => {
    renderBar()

    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription('Partial match, case-insensitive')
  })

  it('sends the typed name when the search is submitted', async () => {
    const user = userEvent.setup()
    const { onChange } = renderBar()

    await user.type(screen.getByLabelText('Name'), 'mouse{Enter}')

    expect(onChange).toHaveBeenLastCalledWith({ name: 'mouse' })
  })

  it('sends the chosen category', async () => {
    const user = userEvent.setup()
    const { onChange } = renderBar()

    await user.selectOptions(screen.getByLabelText('Category'), 'c-1')

    expect(onChange).toHaveBeenLastCalledWith({ categoryId: 'c-1' })
  })

  it('offers every category, with All categories first', () => {
    renderBar()

    const options = screen.getByLabelText('Category').querySelectorAll('option')
    expect([...options].map((option) => option.textContent)).toEqual(['All categories', 'Peripherals', 'Accessories'])
  })

  it('sends Active and Inactive, and clears the status filter for All', async () => {
    const user = userEvent.setup()
    const { onChange } = renderBar()

    await user.selectOptions(screen.getByLabelText('Status'), 'active')
    expect(onChange).toHaveBeenLastCalledWith({ active: true })

    await user.selectOptions(screen.getByLabelText('Status'), 'inactive')
    expect(onChange).toHaveBeenLastCalledWith({ active: false })

    await user.selectOptions(screen.getByLabelText('Status'), 'all')
    expect(onChange).toHaveBeenLastCalledWith({ active: undefined })
  })

  it('shows the category list as loading and disables the category choice', () => {
    renderBar({ categories: { status: 'loading' } })

    expect(screen.getByLabelText('Category')).toBeDisabled()
    expect(screen.getByRole('option', { name: 'Loading categories…' })).toBeInTheDocument()
  })

  it('shows the categories as unavailable with a retry that repeats their request', async () => {
    const user = userEvent.setup()
    const { onRetryCategories } = renderBar({ categories: { status: 'error' } })

    expect(screen.getByText('Categories could not be loaded.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry categories' }))

    expect(onRetryCategories).toHaveBeenCalledOnce()
  })

  it('keeps the name the person typed in the field', () => {
    renderBar({ filters: { page: 1, name: 'mouse' } })

    expect(screen.getByLabelText('Name')).toHaveValue('mouse')
  })
})
