import { stockCopy } from '../model/stockCopy'

// The read-only stock lookup (/stock).
export function StockLookupPage() {
  return <h1>{stockCopy.title}</h1>
}
