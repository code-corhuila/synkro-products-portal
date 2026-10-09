import { session } from 'shell/session'

export function ProductsPage() {
  const user = session.user()

  return (
    <>
      <h1>Products</h1>
      {user && <p>Signed in as {user.sub}</p>}
    </>
  )
}
