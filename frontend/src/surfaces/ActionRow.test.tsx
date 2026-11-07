// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { ActionRow } from './ActionRow.tsx'

// UX-DR121: two buttons sit side by side only at a container of 400px or more and a text scale of 130% or less.
const A = 'First'
const B = 'Second'

function layout(width: number, rootPx: number) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width } as DOMRect)
  document.documentElement.style.fontSize = `${rootPx}px`
  render(
    <ActionRow>
      <button>{A}</button>
      <button>{B}</button>
    </ActionRow>,
  )
  return screen.getByRole('button', { name: A }).parentElement!.getAttribute('data-layout')
}

afterEach(() => {
  document.documentElement.style.fontSize = ''
  vi.restoreAllMocks()
})

test.each([
  [399, 16, 'stack'],
  [400, 16, 'row'],
  [800, 16, 'row'],
  [800, 20.8, 'row'], // 130% of 16px
  [800, 21, 'stack'], // just above 130%
  [800, 32, 'stack'], // 200%
  [399, 20.8, 'stack'],
])('a %ipx container at a %ipx root lays out as %s', (width, rootPx, expected) => {
  expect(layout(width, rootPx)).toBe(expected)
})
