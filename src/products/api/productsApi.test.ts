import { apiClient } from '../../test-doubles/shellApiClient'
import { listProducts } from './productsApi'

describe('productsApi', () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch')

  beforeEach(() => {
    apiClient.request.mockReset()
    fetchSpy.mockClear()
  })

  it("sends the request through the host's client with a relative path", async () => {
    apiClient.request.mockResolvedValue({ data: [] })

    await listProducts()

    expect(apiClient.request).toHaveBeenCalledExactlyOnceWith('/api/v1/products')
  })

  it("returns what the host's client resolves with", async () => {
    apiClient.request.mockResolvedValue({ data: ['p1'] })

    await expect(listProducts()).resolves.toEqual({ data: ['p1'] })
  })

  it("lets the host's error reach the caller untouched", async () => {
    const failure = new Error('host-mapped error')
    apiClient.request.mockRejectedValue(failure)

    await expect(listProducts()).rejects.toBe(failure)
  })

  it('never calls fetch itself', async () => {
    apiClient.request.mockResolvedValue({ data: [] })

    await listProducts()

    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
