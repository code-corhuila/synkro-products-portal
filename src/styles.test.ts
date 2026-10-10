import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

// The portal's styles read the host's design tokens by name (var(--token)) and
// never carry a colour, spacing or font value of their own, so a change in the
// design system reaches every screen, in both themes, without touching a portal.
const SRC = join(import.meta.dirname)

function stylesheets(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    if (statSync(path).isDirectory()) return stylesheets(path)
    return path.endsWith('.css') ? [path] : []
  })
}

// A declaration that sets a value of the kinds the tokens cover.
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklch|oklab)\(/
const TOKEN_PROPERTIES =
  /^\s*(?:padding|margin|gap|row-gap|column-gap|font-size|font-family|font-weight|line-height|border-radius|box-shadow|color|background|background-color|border-color)\s*:\s*([^;]+);/gm

describe('portal stylesheets', () => {
  const files = stylesheets(SRC)

  it('exist for the screens that are styled', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it.each(files.map((file) => [file.slice(SRC.length + 1), file]))('%s uses no colour literal', (_name, file) => {
    expect(readFileSync(file, 'utf8')).not.toMatch(COLOR_LITERAL)
  })

  it.each(files.map((file) => [file.slice(SRC.length + 1), file]))(
    '%s sets spacing, type and colour only from tokens',
    (_name, file) => {
      const css = readFileSync(file, 'utf8')
      const literals = [...css.matchAll(TOKEN_PROPERTIES)]
        .map(([declaration, value]) => ({ declaration: declaration.trim(), value }))
        // Zero, keywords, and anything built from a token are allowed.
        .filter(({ value }) => !/var\(--|^(?:0|none|inherit|currentColor|transparent|auto|normal)\b/.test(value.trim()))

      expect(literals).toEqual([])
    },
  )
})
