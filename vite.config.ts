import federation from '@originjs/vite-plugin-federation'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { federationConfig } from './src/federation.config.ts'

export default defineConfig({
  plugins: [react(), federation(federationConfig)],
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
  },
})
