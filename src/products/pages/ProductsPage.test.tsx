import { render, screen } from '@testing-library/react'
import { signInAs } from '../../test-doubles/shellSession'
import { ProductsPage } from './ProductsPage'

describe('ProductsPage', () => {
  afterEach(() => signInAs(null))

  it('shows the Products heading', () => {
    render(<ProductsPage />)

    expect(screen.getByRole('heading', { name: 'Products' })).toBeInTheDocument()
  })

  it("names the user from the host's session", () => {
    signInAs({ sub: 'inventory-user', role: 'INVENTORY' })

    render(<ProductsPage />)

    expect(screen.getByText('Signed in as inventory-user')).toBeInTheDocument()
  })

  it('still renders when the host session has no user', () => {
    render(<ProductsPage />)

    expect(screen.queryByText(/Signed in as/)).not.toBeInTheDocument()
  })
})
