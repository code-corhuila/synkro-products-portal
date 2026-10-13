import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('never submits unless it says so', () => {
    render(<Button>Buscar</Button>)

    expect(screen.getByRole('button', { name: 'Buscar' })).toHaveAttribute('type', 'button')
  })

  it('has a small size for an action that sits inside a tile', () => {
    render(<Button size="small">Reintentar</Button>)

    expect(screen.getByRole('button').className).toMatch(/small/)
  })

  it('is regular unless it asks for small', () => {
    render(<Button>Reintentar</Button>)

    expect(screen.getByRole('button').className).not.toMatch(/small/)
  })
})
