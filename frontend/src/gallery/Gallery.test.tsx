// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test } from 'vitest'
import tokensCss from '../styles/tokens.css?raw'
import { NAV_ICON_NAMES, SAMPLE_ICON_NAMES } from '../icons/names.ts'
import { Gallery } from './Gallery.tsx'

afterEach(() => document.documentElement.removeAttribute('data-theme'))

test('the gallery lists every colour token, the type scale, spacing and radii', () => {
  render(<Gallery />)

  const lightTokens = [...tokensCss.matchAll(/^\s+--([\w-]+):\s*#[0-9A-Fa-f]{6,8};/gm)]
    .map(([, name]) => name)
    .filter((name) => !name.endsWith('-dark'))
  const swatches = within(screen.getByRole('region', { name: 'Colour tokens' })).getAllByRole('listitem')
  expect(swatches).toHaveLength(lightTokens.length)

  expect(screen.getByRole('region', { name: 'Type scale' }).querySelectorAll('p')).toHaveLength(9)
  expect(within(screen.getByRole('region', { name: 'Spacing and sizes' })).getAllByRole('listitem').length).toBeGreaterThan(10)
  expect(within(screen.getByRole('region', { name: 'Radii' })).getAllByRole('listitem')).toHaveLength(5)
})

test('the Light / Dark toggle switches the page mode without storing it', async () => {
  render(<Gallery />)

  await userEvent.click(screen.getByRole('button', { name: 'Dark' }))
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true')

  await userEvent.click(screen.getByRole('button', { name: 'Light' }))
  expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  expect(localStorage.length).toBe(0)
})

test('the toggle starts on the applied choice and can return to System', async () => {
  document.documentElement.setAttribute('data-theme', 'dark')
  localStorage.setItem('littlesteps.theme', 'dark')
  render(<Gallery />)
  expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true')

  await userEvent.click(screen.getByRole('button', { name: 'System' }))
  expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  localStorage.clear()
})

test('[P1] the gallery shows Domain tags on their tints and the icon tiles at three sizes', () => {
  render(<Gallery />)

  const tags = within(screen.getByRole('region', { name: 'Domain tints' })).getAllByRole('listitem')
  expect(tags.map((t) => t.firstElementChild?.getAttribute('data-tint'))).toEqual([
    'joint-attention',
    'communication',
    'motor-imitation',
    'play',
    'regulation',
    'sensory',
    'other',
  ])

  const tiles = screen.getByRole('region', { name: 'Icons' }).querySelectorAll('[data-size]')
  expect(new Set([...tiles].map((t) => t.getAttribute('data-size')))).toEqual(new Set(['76', '56', '36']))
  expect(tiles).toHaveLength((NAV_ICON_NAMES.length + SAMPLE_ICON_NAMES.length) * 3)
})
