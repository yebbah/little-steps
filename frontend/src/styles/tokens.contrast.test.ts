import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'

// R-02 (Story 2.1): every DESIGN.md token pairing passes WCAG AA in light and dark.
// RED PHASE: src/styles/tokens.css does not exist yet. Remove `.skip` when Story 2.1 creates it.
// Green phase: extend PAIRINGS to every pairing DESIGN.md lists (domain tints x ink/ink-soft/action/block,
// source badges, attention, danger, tip-surface) and read the list from DESIGN.md instead of hand-copying it.

type Pairing = { text: string; surface: string; min: number }

const TEXT = 4.5
const CONTROL_EDGE = 3

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
]

function readTokens(css: string): Map<string, string> {
  const tokens = new Map<string, string>()
  for (const [, name, value] of css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)) tokens.set(name, value)
  return tokens
}

function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2)
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

test.skip('[P0] AC-2 every token pairing meets WCAG AA in light and dark', () => {
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
