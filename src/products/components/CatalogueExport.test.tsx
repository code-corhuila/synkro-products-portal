import { fireEvent, render, screen } from '@testing-library/react'
import { mouse, keyboard } from '../../test-doubles/productsFixtures'
import { listAllMatchingProducts } from '../api/exportProducts'
import { downloadBlob } from '../export/downloadBlob'
import { buildCatalogueWorkbook } from '../export/workbook'
import { CatalogueExport } from './CatalogueExport'

vi.mock(import('../api/exportProducts'), async (original) => ({
  ...await original(),
  listAllMatchingProducts: vi.fn(),
}))
vi.mock('../export/workbook', () => ({ buildCatalogueWorkbook: vi.fn() }))
vi.mock('../export/downloadBlob', () => ({ downloadBlob: vi.fn() }))

beforeEach(() => vi.resetAllMocks())

it('downloads only products with stock when the option is selected', async () => {
  const filters = { name: 'Peripheral', page: 1 }
  const file = new Blob()
  vi.mocked(listAllMatchingProducts).mockResolvedValueOnce([{ ...mouse, stock: 3 }, { ...keyboard, stock: 0 }])
  vi.mocked(buildCatalogueWorkbook).mockResolvedValueOnce(file)
  render(<CatalogueExport filters={filters} categories={[]} />)

  fireEvent.click(screen.getByRole('checkbox', { name: 'Solo con existencias' }))
  fireEvent.click(screen.getByRole('button', { name: 'Descargar Excel' }))

  await screen.findByText('Catálogo descargado')
  expect(listAllMatchingProducts).toHaveBeenCalledWith(filters, { signal: expect.any(AbortSignal) })
  expect(buildCatalogueWorkbook).toHaveBeenCalledWith([expect.objectContaining({ sku: mouse.productId, stock: 3 })])
  expect(downloadBlob).toHaveBeenCalledWith(file, 'catalogo-productos.xlsx')
})

it('explains missing permission and skips workbook generation', async () => {
  vi.mocked(listAllMatchingProducts).mockRejectedValueOnce({ status: 403 })
  render(<CatalogueExport filters={{ page: 1 }} categories={[]} />)
  const button = screen.getByRole('button', { name: 'Descargar Excel' })

  fireEvent.click(button)

  expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso')
  expect(button).toBeEnabled()
  expect(buildCatalogueWorkbook).not.toHaveBeenCalled()
  expect(downloadBlob).not.toHaveBeenCalled()
})
