import { fileURLToPath } from 'node:url'
import federation from '@originjs/vite-plugin-federation'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { federationConfig } from './src/federation.config.ts'

const double = (file: string) => fileURLToPath(new URL(`./src/test-doubles/${file}`, import.meta.url))

export default defineConfig(({ mode }) => ({
  // Under Vitest (mode "test") the federation plugin would rewrite the shell
  // imports into remote URLs, so tests alias them to fakes instead.
  plugins: [react(), ...(mode === 'test' ? [] : [federation(federationConfig)])],
  build: {
    target: 'esnext',
    modulePreload: false,
    cssCodeSplit: false,
  },
  preview: { port: 5175, strictPort: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
    alias: {
      'shell/apiClient': double('shellApiClient.ts'),
      'shell/session': double('shellSession.ts'),
    },
  },
}))
