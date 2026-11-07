import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'

// R-02 (Story 2.1): every DESIGN.md token pairing passes WCAG AA in light and dark.
// The pairings are the ones DESIGN.md lists (Colors, Contrast): text on floor and card, the action and
// block fills, every Domain tint with ink, ink-soft, action and block, the source and attention badges,
// and the 1px edges of interactive controls.

type Pairing = { text: string; surface: string; min: number }

const TEXT = 4.5
const CONTROL_EDGE = 3

const DOMAIN_TINTS = [
  'domain-joint-attention',
  'domain-communication',
  'domain-motor-imitation',
  'domain-play',
  'domain-regulation',
  'domain-sensory',
  'domain-other',
]

const PAIRINGS: Pairing[] = [
  { text: 'ink', surface: 'floor', min: TEXT },
  { text: 'ink', surface: 'card', min: TEXT },
  { text: 'ink-soft', surface: 'floor', min: TEXT },
  { text: 'ink-soft', surface: 'card', min: TEXT },
  { text: 'action-foreground', surface: 'action', min: TEXT },
  { text: 'block-foreground', surface: 'block', min: TEXT },
  { text: 'danger-foreground', surface: 'danger', min: TEXT },
  { text: 'care-team', surface: 'care-team-soft', min: TEXT },
  { text: 'parent-proposed', surface: 'parent-proposed-soft', min: TEXT },
  { text: 'attention', surface: 'attention-soft', min: TEXT },
  { text: 'outline-strong', surface: 'card', min: CONTROL_EDGE },
  { text: 'outline-strong', surface: 'floor', min: CONTROL_EDGE },
  { text: 'action', surface: 'floor', min: TEXT },
  { text: 'action', surface: 'card', min: TEXT },
  { text: 'action', surface: 'selected', min: TEXT },
  { text: 'ink', surface: 'selected', min: TEXT },
  { text: 'ink', surface: 'pressed', min: TEXT },
  { text: 'ink-soft', surface: 'selected', min: TEXT },
  { text: 'ink-soft', surface: 'pressed', min: TEXT },
  { text: 'ink', surface: 'tip-surface', min: TEXT },
  { text: 'ink', surface: 'attention-soft', min: TEXT },
  { text: 'ink-soft', surface: 'tip-surface', min: TEXT },
  { text: 'mask-cover-foreground', surface: 'mask-cover', min: TEXT },
  { text: 'danger', surface: 'card', min: TEXT },
  { text: 'danger', surface: 'floor', min: TEXT },
  { text: 'attention', surface: 'card', min: CONTROL_EDGE },
  { text: 'focus-ring', surface: 'floor', min: CONTROL_EDGE },
  { text: 'focus-ring', surface: 'card', min: CONTROL_EDGE },
  { text: 'focus-ring', surface: 'selected', min: CONTROL_EDGE },
  ...DOMAIN_TINTS.flatMap((tint) =>
    ['ink', 'ink-soft', 'action', 'block'].map((text) => ({ text, surface: tint, min: TEXT })),
  ),
  ...DOMAIN_TINTS.map((tint) => ({ text: 'focus-ring', surface: tint, min: CONTROL_EDGE })),
]

function readTokens(css: string): Map<string, string> {
  const tokens = new Map<string, string>()
  for (const [, name, value] of css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)) tokens.set(name, value)
  return tokens
}

function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2)
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

test('[P0] AC-2 every token pairing meets WCAG AA in light and dark', () => {
  // Given the shipped token sheet
  const tokens = readTokens(readFileSync(resolve(__dirname, 'tokens.css'), 'utf8'))

  // When each pairing is measured in both modes (dark uses the -dark twin of both tokens)
  const misses: string[] = []
  for (const mode of ['', '-dark']) {
    for (const { text, surface, min } of PAIRINGS) {
      const fg = tokens.get(text + mode)
      const bg = tokens.get(surface + mode)
      const ratio = fg && bg ? contrast(fg, bg) : 0
      if (ratio < min) misses.push(`${text}${mode} on ${surface}${mode}: ${ratio.toFixed(2)} < ${min}`)
    }
  }

  // Then nothing misses (criterion-defining assertion: the list of misses is empty)
  expect(misses).toEqual([])
})

test('[P0] AC-2 the measure fails a pairing that misses AA (the test can fail)', () => {
  // Ink-soft on floor-dark is far below 4.5:1 with these made-up values
  expect(contrast('#555A66', '#17191F')).toBeLessThan(TEXT)
  expect(contrast('#23252B', '#FAF7F2')).toBeGreaterThan(TEXT)
})

// The sheet edge sits over the scrimmed page (DESIGN.md, Colors: scrim). The scrim is 8-digit hex, so it
// is composited over the surface before measuring. Light: the card edge against the dimmed surface.
// Dark: outline-strong-dark against the dimmed surface.
function composite(scrimHex: string, surface: string): string {
  const alpha = parseInt(scrimHex.slice(7, 9), 16) / 255
  const mix = (i: number) => {
    const fg = parseInt(scrimHex.slice(1 + i * 2, 3 + i * 2), 16)
    const bg = parseInt(surface.slice(1 + i * 2, 3 + i * 2), 16)
    return Math.round(fg * alpha + bg * (1 - alpha)).toString(16).padStart(2, '0')
  }
  return `#${mix(0)}${mix(1)}${mix(2)}`
}

test('[P0] AC-2 the sheet edge keeps 3:1 over the scrimmed floor, card and selected, in light and dark', () => {
  const css = readFileSync(resolve(__dirname, 'tokens.css'), 'utf8')
  const hex = (name: string) => css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6,8})`))![1]
  const misses: string[] = []
  for (const surface of ['floor', 'card', 'selected']) {
    const lightEdge = contrast(hex('card'), composite(hex('scrim'), hex(surface)))
    const darkEdge = contrast(hex('outline-strong-dark'), composite(hex('scrim-dark'), hex(`${surface}-dark`)))
    if (lightEdge < CONTROL_EDGE) misses.push(`light card edge over scrimmed ${surface}: ${lightEdge.toFixed(2)}`)
    if (darkEdge < CONTROL_EDGE) misses.push(`dark outline-strong over scrimmed ${surface}: ${darkEdge.toFixed(2)}`)
  }
  expect(misses).toEqual([])
})
