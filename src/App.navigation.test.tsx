import { act, render, screen } from '@testing-library/react'
import App from './App'
import { navigateTo } from './navigation'

describe('App: following the location', () => {
  afterEach(() => window.history.replaceState({}, '', '/'))

  it('shows the screen of the new location when the portal navigates by itself', () => {
    window.history.replaceState({}, '', '/stock-alerts')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Alertas de stock' })).toBeInTheDocument()

    act(() => navigateTo('/stock'))

    expect(screen.getByRole('heading', { name: 'Existencias' })).toBeInTheDocument()
  })

  it('shows the screen of the new location on browser history changes', () => {
    window.history.replaceState({}, '', '/stock')
    render(<App />)

    act(() => {
      window.history.replaceState({}, '', '/stock-alerts')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(screen.getByRole('heading', { name: 'Alertas de stock' })).toBeInTheDocument()
  })

  it('renders nothing once the location is not one of the portal screens', () => {
    window.history.replaceState({}, '', '/stock')
    const { container } = render(<App />)

    act(() => navigateTo('/dashboard'))

    expect(container).toBeEmptyDOMElement()
  })
})
