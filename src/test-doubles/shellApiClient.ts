import { vi } from 'vitest'
import type { RequestOptions } from 'shell/apiClient'

// Stand-in for the host's `shell/apiClient` under Vitest. It follows the host
// contract: `query` is appended to the path, and a request whose signal aborts
// rejects with the host's CANCELLED shape. Tests script the answer with
// mockResolvedValue or mockImplementation; the last call is in request.mock.
export const apiClient = {
  request: vi.fn(hostRequest),
}

// Pending until its signal aborts: an unscripted request never answers by itself.
export function hostRequest(_path: string, options: RequestOptions = {}): Promise<unknown> {
  const { signal } = options

  return new Promise((_resolve, reject) => {
    if (signal?.aborted) {
      reject(cancelledError())
      return
    }
    signal?.addEventListener('abort', () => reject(cancelledError()), { once: true })
  })
}

export function buildRequestUrl(path: string, query?: RequestOptions['query']): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) params.append(key, String(value))
  }

  const search = params.toString()
  return search ? `${path}?${search}` : path
}

// The URL the host would call for the most recent request.
export function lastRequestUrl(): string {
  const [path, options] = apiClient.request.mock.lastCall ?? []
  return buildRequestUrl(path ?? '', options?.query)
}

function cancelledError(): Error {
  return Object.assign(new Error('CANCELLED'), { status: 0, body: { error: 'CANCELLED' } })
}
