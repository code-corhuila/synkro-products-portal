import { apiClient, lastRequestUrl } from '../../test-doubles/shellApiClient'
import { mouse, keyboard, productsPage } from '../../test-doubles/productsFixtures'
import type { ProductResponse } from '../model/product'
import { EXPORT_MAX_PAGES, ExportTooLargeError, listAllMatchingProducts } from './exportProducts'

function pageOf(data: ProductResponse[], page: number, totalPages: number) {
  return { data, meta: { page, limit: 20, total: totalPages, totalPages } }
}

describe('listAllMatchingProducts', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  it('reads a single page when there is only one', async () => {
    apiClient.request.mockResolvedValueOnce(productsPage([mouse]))

    const products = await listAllMatchingProducts({ page: 1 })

    expect(products).toEqual([mouse])
    expect(apiClient.request).toHaveBeenCalledTimes(1)
  })

  it('reads every page, in order, and returns every product', async () => {
    apiClient.request
      .mockResolvedValueOnce(pageOf([mouse], 1, 2))
      .mockResolvedValueOnce(pageOf([keyboard], 2, 2))

    const products = await listAllMatchingProducts({ page: 1 })

    expect(products).toEqual([mouse, keyboard])
    expect(apiClient.request).toHaveBeenCalledTimes(2)
    expect(lastRequestUrl()).toBe('/api/v1/products?page=2&limit=20')
  })

  it('carries the filters onto every page it asks for', async () => {
    apiClient.request
      .mockResolvedValueOnce(pageOf([mouse], 1, 2))
      .mockResolvedValueOnce(pageOf([keyboard], 2, 2))

    await listAllMatchingProducts({ page: 1, name: 'mouse', categoryId: 'c-1', active: true })

    expect(lastRequestUrl()).toBe('/api/v1/products?page=2&limit=20&name=mouse&categoryId=c-1&active=true')
  })

  it("overrides a filter's own page with the page it is reading", async () => {
    apiClient.request.mockResolvedValueOnce(productsPage([mouse]))

    await listAllMatchingProducts({ page: 7 })

    expect(lastRequestUrl()).toBe('/api/v1/products?page=1&limit=20')
  })

  it('returns no products after one read when there are none', async () => {
    apiClient.request.mockResolvedValueOnce(productsPage([]))

    await expect(listAllMatchingProducts({ page: 1 })).resolves.toEqual([])
    expect(apiClient.request).toHaveBeenCalledTimes(1)
  })

  it('passes the abort signal on every page', async () => {
    apiClient.request
      .mockResolvedValueOnce(pageOf([mouse], 1, 2))
      .mockResolvedValueOnce(pageOf([keyboard], 2, 2))
    const controller = new AbortController()

    await listAllMatchingProducts({ page: 1 }, { signal: controller.signal })

    for (const [, options] of apiClient.request.mock.calls) {
      expect(options?.signal).toBe(controller.signal)
    }
  })

  it('stops after the first page, and asks for nothing more, past the bound', async () => {
    apiClient.request.mockResolvedValueOnce(pageOf([mouse], 1, EXPORT_MAX_PAGES + 1))

    await expect(listAllMatchingProducts({ page: 1 })).rejects.toBeInstanceOf(ExportTooLargeError)
    expect(apiClient.request).toHaveBeenCalledTimes(1)
  })

  it('accepts exactly the bound', async () => {
    for (let page = 1; page <= EXPORT_MAX_PAGES; page += 1) {
      apiClient.request.mockResolvedValueOnce(pageOf([{ ...mouse, productId: `p-${page}` }], page, EXPORT_MAX_PAGES))
    }
    await expect(listAllMatchingProducts({ page: 1 })).resolves.toHaveLength(EXPORT_MAX_PAGES)
  })

  it('rejects the whole export, with no further request, when a later page fails', async () => {
    const failure = new Error('host-mapped error')
    apiClient.request
      .mockResolvedValueOnce(pageOf([mouse], 1, 3))
      .mockRejectedValueOnce(failure)

    await expect(listAllMatchingProducts({ page: 1 })).rejects.toBe(failure)
    expect(apiClient.request).toHaveBeenCalledTimes(2)
  })

  it('lets the host error reach the caller untouched', async () => {
    const failure = Object.assign(new Error('Forbidden'), { status: 403, body: { error: 'FORBIDDEN' } })
    apiClient.request.mockRejectedValueOnce(failure)

    await expect(listAllMatchingProducts({ page: 1 })).rejects.toBe(failure)
  })
})
