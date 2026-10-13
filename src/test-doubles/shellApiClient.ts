import { vi } from 'vitest'

// Stand-in for the host's `shell/apiClient` under Vitest.
export const apiClient = {
  request: vi.fn(),
}
