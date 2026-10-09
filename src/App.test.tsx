import { render, screen } from '@testing-library/react'
import App from './App'

describe('App (the module the host mounts)', () => {
  it('renders the Products screen', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Products' })).toBeInTheDocument()
  })
})
