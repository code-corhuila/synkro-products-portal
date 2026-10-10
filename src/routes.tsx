import type { ReactElement } from 'react'
import { ProductsPage } from './products/pages/ProductsPage'

// The host mounts this App for the portal's routes and does not share a router
// with it. This table maps each path to its screen, read from the browser's
// location. Replace this file, not the screens, if the host passes the path instead.
const routes: { pattern: RegExp; screen: ReactElement }[] = [
  { pattern: /^\/products\/?$/, screen: <ProductsPage /> },
]

export function resolveScreen(pathname: string): ReactElement | null {
  return routes.find((route) => route.pattern.test(pathname))?.screen ?? null
}
