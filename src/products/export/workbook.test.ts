// @vitest-environment node
import { ValueType, Workbook } from 'exceljs'
import { exportCopy } from '../model/exportCopy'
import type { ProductExportRow } from '../model/exportRow'
import { buildCatalogueWorkbook } from './workbook'

async function readBack(blob: Blob) {
  const buffer = await blob.arrayBuffer()
  const workbook = new Workbook()
  await workbook.xlsx.load(buffer as never)
  return workbook.getWorksheet(exportCopy.sheetName)!
}

const mouseRow: ProductExportRow = { sku: 'p-1', name: 'Wireless mouse', category: 'Peripherals', price: 1234.56, stock: 7 }

describe('buildCatalogueWorkbook', () => {
  it('produces a readable xlsx with the expected sheet and headers', async () => {
    const blob = await buildCatalogueWorkbook([mouseRow])

    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    const sheet = await readBack(blob)
    expect((sheet.getRow(1).values as unknown[]).slice(1)).toEqual(['Referencia de producto', 'Nombre', 'Categoría', 'Precio', 'Stock'])
  })

  it('writes one row per product, in order, with the right values', async () => {
    const keyboardRow: ProductExportRow = { sku: 'p-2', name: 'Mechanical keyboard', category: 'Unknown', price: 0, stock: 0 }
    const blob = await buildCatalogueWorkbook([mouseRow, keyboardRow])

    const sheet = await readBack(blob)
    expect((sheet.getRow(2).values as unknown[]).slice(1)).toEqual(['p-1', 'Wireless mouse', 'Peripherals', 1234.56, 7])
    expect((sheet.getRow(3).values as unknown[]).slice(1)).toEqual(['p-2', 'Mechanical keyboard', 'Unknown', 0, 0])
    expect(sheet.rowCount).toBe(3)
  })

  it('writes price and stock as real numbers, not text', async () => {
    const blob = await buildCatalogueWorkbook([mouseRow])

    const sheet = await readBack(blob)
    const row = sheet.getRow(2)
    expect(typeof row.getCell(4).value).toBe('number')
    expect(typeof row.getCell(5).value).toBe('number')
    expect(row.getCell(4).numFmt).toBe('#,##0.00')
    expect(row.getCell(5).numFmt).toBe('#,##0')
  })

  it('sanitizes a name that looks like a formula into literal text', async () => {
    const adversarial: ProductExportRow = { sku: 'p-3', name: '=SUM(A1:A2)', category: 'Peripherals', price: 1, stock: 1 }
    const blob = await buildCatalogueWorkbook([adversarial])

    const sheet = await readBack(blob)
    const cell = sheet.getRow(2).getCell(2)
    expect(cell.value).toBe("'=SUM(A1:A2)")
    expect(cell.type).not.toBe(ValueType.Formula)
  })

  it('produces an empty data section, with just the header, for no rows', async () => {
    const blob = await buildCatalogueWorkbook([])

    const sheet = await readBack(blob)
    expect(sheet.rowCount).toBe(1)
  })
})
