import { existsSync, readFileSync } from 'node:fs'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { federationConfig } from './federation.config'
import { default as hostPackage } from '../package.json'

// The host (synkro-front) imports `productsPortal/App` from
// http://localhost:5175/assets/remoteEntry.js and mounts the default export.
describe('federation config', () => {
  it('is named after the remote the host registers', () => {
    expect(federationConfig.name).toBe('productsPortal')
  })

  it('serves its entry where the host looks for it', () => {
    expect(federationConfig.filename).toBe('remoteEntry.js')
  })

  it('exposes the root module as ./App', () => {
    expect(federationConfig.exposes).toEqual({ './App': './src/App.tsx' })
  })

  it('shares react and react-dom as the only shared libraries', () => {
    expect(Object.keys(federationConfig.shared)).toEqual(['react', 'react-dom'])
  })

  it('shares react and react-dom at the host version range', () => {
    expect(federationConfig.shared.react.requiredVersion).toBe(hostPackage.dependencies.react)
    expect(federationConfig.shared['react-dom'].requiredVersion).toBe(hostPackage.dependencies['react-dom'])
    expect(hostPackage.dependencies.react).toBe('^19.2.8')
  })

  it('reaches the host client and session through the shell remote', () => {
    expect(Object.keys(federationConfig.remotes)).toEqual(['shell'])
  })
})

describe('built remote entry', () => {
  const outDir = mkdtempSync(join(tmpdir(), 'products-portal-'))

  beforeAll(async () => {
    await build({ logLevel: 'silent', build: { outDir, emptyOutDir: true } })
  }, 120_000)

  afterAll(() => rmSync(outDir, { recursive: true, force: true }))

  it('emits assets/remoteEntry.js', () => {
    expect(existsSync(join(outDir, 'assets', 'remoteEntry.js'))).toBe(true)
  })

  it('declares ./App among the entry exposed modules', () => {
    const entry = readFileSync(join(outDir, 'assets', 'remoteEntry.js'), 'utf8')
    expect(entry).toContain('"./App"')
  })
})
