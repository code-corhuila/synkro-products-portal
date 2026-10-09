// Modules the host (synkro-front) exposes through Module Federation. They are
// resolved by the federation plugin at build time, not by TypeScript, and the
// portal never defines its own: the host owns the single HTTP client and the
// session (it adds the gateway address, credential, correlation id and timeout).
declare module 'shell/apiClient' {
  export interface ApiRequestOptions {
    method?: string
    body?: unknown
    headers?: Record<string, string>
  }

  export const apiClient: {
    request<T>(path: string, options?: ApiRequestOptions): Promise<T>
  }
}

declare module 'shell/session' {
  export interface ShellUser {
    sub: string
    role: string
  }

  export const session: {
    user(): ShellUser | null
  }
}
