export type StockState = 'in-stock' | 'out-of-stock'

// "Stock bajo" needs the worker's threshold and belongs to the stock alerts, so
// the list only tells apart a product that can be sold from one that cannot.
export function stockStateOf(stock: number): StockState {
  return stock > 0 ? 'in-stock' : 'out-of-stock'
}
