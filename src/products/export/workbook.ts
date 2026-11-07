import { exportCopy } from '../model/exportCopy'
import type { ProductExportRow } from '../model/exportRow'
import { safeText } from './safeText'

export async function buildCatalogueWorkbook(rows: ProductExportRow[]): Promise<Blob> {
  const { default: writeWorkbook } = await import('write-excel-file/universal')
  const { sku, name, category, price, stock } = exportCopy.columns
  const data = rows.map((row) => [
    safeText(row.sku),
    safeText(row.name),
    safeText(row.category),
    { value: row.price, format: '#,##0.00' },
    { value: row.stock, format: '#,##0' },
  ])
  return writeWorkbook([[sku, name, category, price, stock], ...data], {
    sheet: exportCopy.sheetName,
    columns: [{ width: 39 }, { width: 32 }, { width: 20 }, { width: 16 }, { width: 10 }],
  }).toBlob()
}
