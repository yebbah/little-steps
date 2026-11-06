// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import { IconTile, type IconTileSize } from './IconTile.tsx'
import { ICONS } from './glyphs.tsx'
import { NAV_ICON_NAMES, SAMPLE_ICON_NAMES, STROKE_WIDTH } from './names.ts'

test('[P1] every nav destination has an icon, so a missing one fails here', () => {
  expect(NAV_ICON_NAMES).toEqual(['today', 'goals', 'activities', 'share', 'family'])
  for (const name of [...NAV_ICON_NAMES, ...SAMPLE_ICON_NAMES]) expect(ICONS[name], name).toBeTruthy()
})

test('[P1] no icon is named for a person, mascot or reward', () => {
  const banned = /person|people|child|kid|face|mascot|avatar|ring|streak|badge|trophy|medal|star/i
  for (const name of Object.keys(ICONS)) expect(name).not.toMatch(banned)
})

test('[P1] tiles at 76, 56 and 36px hold a decorative 2.4px line icon, flat and card-coloured', () => {
  expect(STROKE_WIDTH).toBe(2.4)
  for (const size of [76, 56, 36] as IconTileSize[]) {
    const { container, unmount } = render(<IconTile name="book" size={size} />)
    const tile = container.firstElementChild as HTMLElement
    expect(tile.style.width).toBe(`${size}px`)
    expect(tile.style.height).toBe(`${size}px`)
    expect(tile.style.background).toBe('')
    expect(tile.style.boxShadow).toBe('')
    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('stroke-width', '2.4')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('fill', 'none')
    unmount()
  }
})

test('[P1] only the 36px tile takes a Domain tint', () => {
  const small = render(<IconTile name="leaf" size={36} tint="play" />).container.firstElementChild as HTMLElement
  expect(small.style.background).toBe('var(--color-domain-play)')
  const hero = render(<IconTile name="leaf" size={76} tint="play" />).container.firstElementChild as HTMLElement
  expect(hero.style.background).toBe('')
})
