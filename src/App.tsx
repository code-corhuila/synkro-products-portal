import { useSyncExternalStore } from 'react'
import { resolveScreen } from './routes'

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  return () => window.removeEventListener('popstate', onChange)
}

const currentPath = () => window.location.pathname

// The module the host mounts as `productsPortal/App`. It renders the screen for
// the location the host routed to, and nothing for a route the portal does not own.
// It follows the location itself (popstate), so a screen change made by the portal
// or by the browser's history shows the right screen whatever the host re-renders.
export default function App() {
  const pathname = useSyncExternalStore(subscribe, currentPath)
  return resolveScreen(pathname)
}
