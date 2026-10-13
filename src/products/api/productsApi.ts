import { apiClient } from 'shell/apiClient'

const PRODUCTS_PATH = '/api/v1/products'

// Every call goes through the host's single client, which adds the gateway
// address, credential, correlation id and timeout. Response types arrive with
// the screens that read them.
export function listProducts<T = unknown>(): Promise<T> {
  return apiClient.request<T>(PRODUCTS_PATH)
}
