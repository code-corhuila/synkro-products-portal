import { tableColumns } from '../model/tableColumns'
import styles from './ProductsTable.module.css'

// The header row, shared by the table and its skeleton so both have the same columns.
export function ProductsTableHead() {
  return (
    <thead>
      <tr>
        {tableColumns.map((column) => (
          <th key={column.id} scope="col" className={column.numeric ? styles.numericHeader : undefined}>
            {column.header}
          </th>
        ))}
      </tr>
    </thead>
  )
}
