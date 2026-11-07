// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import { usePinnedBottom } from './usePinnedBottom.ts'

function Nav() {
  const ref = useRef<HTMLElement>(null)
  usePinnedBottom(ref)
  return <nav ref={ref} aria-label="Main" />
}

const root = document.documentElement
afterEach(() => vi.unstubAllGlobals())

function stubMedia(matches: boolean) {
  const listeners: (() => void)[] = []
  const query = { matches, addEventListener: (_: string, l: () => void) => listeners.push(l), removeEventListener: vi.fn() }
  vi.stubGlobal('matchMedia', () => query)
  return { query, fire: () => listeners.forEach((l) => l()) }
}

test('a pinned nav publishes its measured height and removes it when it goes away', () => {
  stubMedia(true)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ height: 71.2 } as DOMRect)
  const view = render(<Nav />)
  expect(root.style.getPropertyValue('--pinned-bottom-height')).toBe('72px')
  view.unmount()
  expect(root.style.getPropertyValue('--pinned-bottom-height')).toBe('')
})

test('an unpinned nav (short screen, or the rail) publishes 0, and a change of the media query updates it', () => {
  const media = stubMedia(false)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ height: 64 } as DOMRect)
  render(<Nav />)
  expect(root.style.getPropertyValue('--pinned-bottom-height')).toBe('0px')
  media.query.matches = true
  media.fire()
  expect(root.style.getPropertyValue('--pinned-bottom-height')).toBe('64px')
})

test('without matchMedia (jsdom) nothing is published and nothing throws', () => {
  vi.stubGlobal('matchMedia', undefined)
  expect(() => render(<Nav />)).not.toThrow()
  expect(root.style.getPropertyValue('--pinned-bottom-height')).toBe('')
})
