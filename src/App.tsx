import { resolveScreen } from './routes'

// The module the host mounts as `productsPortal/App`. It renders the screen for
// the location the host routed to, and nothing for a route the portal does not own.
export default function App() {
  return resolveScreen(window.location.pathname)
}
