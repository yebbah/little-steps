import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

// UX-DR121 / WCAG 1.4.12: chips, the status line, steppers and banners use min-height and padding, never a
// fixed height, so they grow with text size and text spacing. The browser checks are in e2e/tests/a11y-reflow.spec.ts.

const css = (file: string) => readFileSync(`${import.meta.dirname}/../${file}`, 'utf8')

/** Declarations of a plain `height:` (not min-, max- or line-height) outside the blocks named in `allowed`. */
function fixedHeights(source: string, allowed: string[] = []): string[] {
  const found: string[] = []
  for (const [, selector, body] of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (allowed.some((name) => selector.includes(name))) continue
    for (const line of body.split(';')) if (/^\s*height\s*:/.test(line)) found.push(`${selector.trim()}: ${line.trim()}`)
  }
  return found
}

test.each([
  ['ui/ChoiceChips.module.css', ['.input']], // the transparent native input only overlays the chip
  ['ui/Stepper.module.css', []],
  ['ui/TextField.module.css', []],
  ['ui/Button.module.css', []],
  ['ui/DisclosureRow.module.css', []],
  ['surfaces/StatusLine.module.css', []],
  ['surfaces/Banner.module.css', []],
  ['surfaces/Labels.module.css', []],
  ['shell/AppShell.module.css', ['.visuallyHidden', '.navIcon', '::before']], // icon box, indicator bar and the hidden status region are shapes, not text boxes
])('%s has no fixed height on a text box', (file, allowed) => {
  expect(fixedHeights(css(file), allowed)).toEqual([])
})

test('the checker itself flags a fixed height and ignores min-height', () => {
  expect(fixedHeights('.a { height: 40px; }')).toHaveLength(1)
  expect(fixedHeights('.a { min-height: 40px; line-height: 1.5; max-height: 3rem; }')).toEqual([])
})
