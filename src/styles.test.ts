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

const read = (file: string) => readFileSync(join(SRC, file), 'utf8')

// The text of the `{ ... }` block that starts at the first `{` after `start`.
function blockAfter(css: string, start: string): string | undefined {
  const from = css.indexOf(start)
  if (from === -1) return undefined
  let depth = 0
  for (let index = css.indexOf('{', from); index < css.length; index += 1) {
    if (css[index] === '{') depth += 1
    if (css[index] === '}' && --depth === 0) return css.slice(css.indexOf('{', from) + 1, index)
  }
  return undefined
}

// Every `{ ... }` block that starts at a `{` following an occurrence of `start`, in order.
function blocksAfter(css: string, start: string): string[] {
  const blocks: string[] = []
  let searchFrom = 0
  for (let from = css.indexOf(start, searchFrom); from !== -1; from = css.indexOf(start, searchFrom)) {
    const openIndex = css.indexOf('{', from)
    let depth = 0
    let closeIndex = -1
    for (let index = openIndex; index < css.length; index += 1) {
      if (css[index] === '{') depth += 1
      if (css[index] === '}' && --depth === 0) { closeIndex = index; break }
    }
    if (closeIndex === -1) break
    blocks.push(css.slice(openIndex + 1, closeIndex))
    searchFrom = closeIndex + 1
  }
  return blocks
}

// The selectors (text before `{`) of each top-level rule inside a block, in order.
function selectorsIn(block: string): string[] {
  return [...block.matchAll(/([^{}]+)\{[^{}]*\}/g)].map(([, selector]) => selector.trim())
}

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

describe('motion', () => {
  const animated = stylesheets(SRC).filter((file) => /^\s*animation(?:-name)?\s*:/m.test(readFileSync(file, 'utf8')))

  it('is used by the skeleton shimmer', () => {
    expect(animated.map((file) => file.slice(SRC.length + 1))).toContain(join('products', 'components', 'Skeleton.module.css'))
  })

  it.each(animated.map((file) => [file.slice(SRC.length + 1), file]))(
    '%s stops its animation under prefers-reduced-motion',
    (_name, file) => {
      const reduced = blockAfter(readFileSync(file, 'utf8'), '@media (prefers-reduced-motion: reduce)')

      expect(reduced).toMatch(/animation\s*:\s*none/)
    },
  )
})

describe('numeric cells', () => {
  const rule = blockAfter(read(join('products', 'components', 'ProductsTable.module.css')), '.numeric') ?? ''

  it('are right-aligned, in the mono face, with tabular numerals', () => {
    expect(rule).toMatch(/text-align\s*:\s*right/)
    expect(rule).toMatch(/font-family\s*:\s*var\(--font-family-mono\)/)
    expect(rule).toMatch(/font-variant-numeric\s*:\s*tabular-nums/)
  })
})

// The dark theme is the person's choice in the host (<html data-theme>), which
// may contradict the device. A prefers-color-scheme rule is tolerated only as a
// transitional fallback for a Host that has not set data-theme yet, and only
// under :root:not([data-theme]) — so a Host that sets data-theme='light' is
// never overridden by the device's dark preference.
it('keys its dark rules to the host theme; prefers-color-scheme only as a :root:not([data-theme]) fallback', () => {
  const css = stylesheets(SRC).map((path) => readFileSync(path, 'utf8')).join('\n')

  expect(css).toContain(":root[data-theme='dark']")
  // No other media condition for colour (e.g. prefers-color-scheme: light) is allowed.
  const schemes = [...css.matchAll(/prefers-color-scheme:\s*(\w+)/g)]
  expect(schemes.every(([, value]) => value === 'dark')).toBe(true)

  const fallbackBlocks = blocksAfter(css, '@media (prefers-color-scheme: dark)')
  expect(fallbackBlocks.length).toBeGreaterThan(0)

  for (const block of fallbackBlocks) {
    const selectors = selectorsIn(block)
    expect(selectors.length).toBeGreaterThan(0)
    for (const selector of selectors) {
      expect(selector).toMatch(/^:root:not\(\[data-theme\]\)/)
      // Every fallback rule must have an explicit data-theme='dark' counterpart.
      const darkSelector = selector.replace(':root:not([data-theme])', ":root[data-theme='dark']")
      expect(css).toContain(darkSelector)
    }
  }
})
