import type { ProductRow } from '../model/product'

interface ProductsTableProps {
  rows: ProductRow[]
}

export function ProductsTable({ rows }: ProductsTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Price</th>
          <th scope="col">Stock</th>
          <th scope="col">Category</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.productId}>
            <td>{row.name}</td>
            <td>{row.price}</td>
            <td>{row.stock}</td>
            <td>{row.category}</td>
            <td>{row.active ? 'Active' : 'Inactive'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
