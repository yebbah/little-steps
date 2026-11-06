import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { THEME_STORAGE_KEY } from './theme.ts'

// Story 2.1 acceptance criteria that can be checked on the files themselves (UX-DR1, 2, 8 to 11).

const read = (file: string) => readFileSync(resolve(__dirname, file), 'utf8')
const tokensCss = read('tokens.css')
const baseCss = read('base.css')

function designMd(): string {
  const root = resolve(__dirname, '../../../.specs/planning-artifacts/ux-designs')
  const dir = readdirSync(root).find((d) => d.startsWith('ux-'))
  return readFileSync(resolve(root, dir ?? '', 'DESIGN.md'), 'utf8')
}

function designColours(): Map<string, string> {
  const block = designMd().split('\ncolors:')[1].split('\ntypography:')[0]
  return new Map([...block.matchAll(/^\s+([\w-]+):\s*'(#[0-9A-Fa-f]+)'/gm)].map(([, n, v]) => [n, v.toUpperCase()]))
}

function cssTokens(): Map<string, string> {
  const root = tokensCss.split('/* Semantic colours')[0]
  return new Map([...root.matchAll(/^\s+--([\w-]+):\s*([^;]+);/gm)].map(([, n, v]) => [n, v.trim()]))
}

describe('colour tokens (UX-DR1, UX-DR2)', () => {
  const design = designColours()
  const css = cssTokens()

  test('DESIGN.md lists colours, so the comparison is not empty', () => {
    expect(design.size).toBeGreaterThan(60)
  })

  test('every DESIGN.md colour exists with its exact value', () => {
    const wrong = [...design].filter(([name, value]) => css.get(name)?.toUpperCase() !== value).map(([name]) => name)
    expect(wrong).toEqual([])
  })

  test('there is no colour in tokens.css that DESIGN.md does not list', () => {
    const extra = [...css].filter(([name, value]) => value.startsWith('#') && !design.has(name)).map(([name]) => name)
    expect(extra).toEqual([])
  })

  test('every light colour has a -dark twin', () => {
    const missing = [...design.keys()].filter((n) => !n.endsWith('-dark') && !css.has(`${n}-dark`))
    expect(missing).toEqual([])
  })

  test('mask-cover is the same in both modes', () => {
    expect(css.get('mask-cover')).toBe(css.get('mask-cover-dark'))
    expect(css.get('mask-cover-foreground')).toBe(css.get('mask-cover-foreground-dark'))
  })

  test('the semantic layer follows the device by default and the explicit choice when set', () => {
    expect(tokensCss).toMatch(/@media \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme='light'\]\)/)
    expect(tokensCss).toMatch(/:root\[data-theme='dark'\]/)
  })
})

describe('type, spacing and radii (UX-DR8 to UX-DR11)', () => {
  const css = cssTokens()

  test('the nine type tokens exist in rem', () => {
    for (const name of ['display', 'title', 'heading', 'section-label', 'body', 'body-sm', 'cue', 'label', 'meta']) {
      expect(css.get(`type-${name}-size`), name).toMatch(/^\d+(\.\d+)?rem$/)
    }
  })

  test('body is 17px at a 100% root', () => {
    expect(css.get('type-body-size')).toBe('1.0625rem')
  })

  test('spacing, target-size and radius tokens match DESIGN.md', () => {
    const md = designMd()
    const spacing = md.split('\nspacing:')[1].split('\ncomponents:')[0]
    const spacingPairs = [...spacing.matchAll(/^\s+'?([\w-]+)'?:\s*(\S+)/gm)]
    expect(spacingPairs.length).toBeGreaterThan(15)
    for (const [, name, value] of spacingPairs) expect(css.get(`space-${name}`), name).toBe(value)
    const rounded = md.split('\nrounded:')[1].split('\nspacing:')[0]
    const roundedPairs = [...rounded.matchAll(/^\s+(\w+):\s*(\S+)/gm)]
    expect(roundedPairs).toHaveLength(5)
    for (const [, name, value] of roundedPairs) expect(css.get(`radius-${name}`), name).toBe(value)
  })

  test('no web font is requested (system font stack only)', () => {
    expect(tokensCss + baseCss).not.toMatch(/@font-face|@import|url\(/)
    expect(css.get('font-stack')).toMatch(/^system-ui/)
  })

  test('the root is 100%, and -apple-system-body is applied only behind the iOS guard', () => {
    expect(baseCss).toMatch(/html\s*\{\s*font-size:\s*100%;\s*\}/)
    expect(baseCss.match(/-apple-system-body/g)).toHaveLength(2) // the @supports condition and the declaration
    expect(baseCss).toMatch(
      /@supports \(font: -apple-system-body\) and \(-webkit-touch-callout: none\)\s*\{\s*html\s*\{\s*font:\s*-apple-system-body;/,
    )
  })

  test('no px font size in the base styles', () => {
    expect(baseCss).not.toMatch(/font-size:\s*\d+px/)
  })
})

describe('theme before first paint', () => {
  test('index.html applies the stored choice with the same storage key as the theme module', () => {
    const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf8')
    const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? ''
    expect(script).toContain(`'${THEME_STORAGE_KEY}'`)
    // The inline script comes before the module script, so it runs before anything renders.
    expect(html.indexOf('<script>')).toBeLessThan(html.indexOf('type="module"'))
  })
})
