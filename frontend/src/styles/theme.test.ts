// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { applyTheme, appliedThemeChoice, isThemeChoice, readThemeChoice, setThemeChoice, THEME_STORAGE_KEY } from './theme.ts'

afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  vi.restoreAllMocks()
})

test('the default is System when nothing is stored', () => {
  expect(readThemeChoice()).toBe('system')
})

test('Dark is stored and applied at once', () => {
  setThemeChoice('dark')

  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  expect(readThemeChoice()).toBe('dark')
})

test('System clears the stored value and the override', () => {
  setThemeChoice('light')
  setThemeChoice('system')

  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
  expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
})

test('applyTheme does not store', () => {
  applyTheme('dark')

  expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
})

test('an invalid stored value reads as System', () => {
  localStorage.setItem(THEME_STORAGE_KEY, 'purple')

  expect(readThemeChoice()).toBe('system')
  expect(isThemeChoice('purple')).toBe(false)
})

test('blocked storage still applies the choice for this visit', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('blocked', 'SecurityError')
  })
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new DOMException('blocked', 'SecurityError')
  })

  setThemeChoice('dark')

  expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  expect(readThemeChoice()).toBe('system')
})

const BARS =
  '<meta name="theme-color" content="#FAF7F2" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#17191F" media="(prefers-color-scheme: dark)">'
const bars = () => [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].map((m) => m.content)

test('the browser bar colour follows an explicit choice: Dark and Light set both metas, System restores the originals', () => {
  document.head.innerHTML = BARS
  applyTheme('dark')
  expect(bars()).toEqual(['#17191F', '#17191F'])
  applyTheme('light')
  expect(bars()).toEqual(['#FAF7F2', '#FAF7F2'])
  applyTheme('system')
  expect(bars()).toEqual(['#FAF7F2', '#17191F'])
  document.head.innerHTML = ''
})

test('the theme the page is showing is read from the page, whatever storage says', () => {
  expect(appliedThemeChoice()).toBe('system')
  applyTheme('dark')
  expect(appliedThemeChoice()).toBe('dark')
})

test('a page with no theme-colour metas is not an error', () => {
  document.head.innerHTML = ''
  expect(() => applyTheme('dark')).not.toThrow()
})
