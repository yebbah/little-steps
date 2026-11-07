// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { BlockCard, Card, HeroBand, TipBlock } from './Surfaces.tsx'
import { AiLabel, CheckTag, SourceBadge } from './Labels.tsx'
import { readdirSync, readFileSync } from 'node:fs'

const surfacesCss = readFileSync(`${import.meta.dirname}/Surfaces.module.css`, 'utf8')
const labelsCss = readFileSync(`${import.meta.dirname}/Labels.module.css`, 'utf8')
const HELLO = 'Hello'

test('cards render their children and take no role of their own', () => {
  render(
    <>
      <Card data-testid="card">{HELLO}</Card>
      <BlockCard data-testid="block">{HELLO}</BlockCard>
      <TipBlock data-testid="tip">{HELLO}</TipBlock>
    </>,
  )
  for (const id of ['card', 'block', 'tip']) {
    expect(screen.getByTestId(id)).toHaveTextContent(HELLO)
    expect(screen.getByTestId(id)).not.toHaveAttribute('role')
    expect(screen.getByTestId(id)).not.toHaveAttribute('tabindex')
  }
})

test('the hero band takes the tint of the family the caller chose', () => {
  render(<HeroBand family="play">{HELLO}</HeroBand>)
  const band = screen.getByText(HELLO)
  expect(band).toHaveAttribute('data-tint', 'play')
  expect(band.style.background).toContain('--color-domain-play')
})

test('surfaces are flat: edges are 1px tokens, radii come from tokens, and there is no shadow', () => {
  expect(surfacesCss).not.toMatch(/box-shadow|filter:\s*drop-shadow/)
  expect(surfacesCss).toMatch(/\.card\s*{[^}]*--radius-xl/)
  expect(surfacesCss).toMatch(/\.blockCard\s*{[^}]*--radius-lg/)
  expect(surfacesCss).toMatch(/\.heroBand\s*{[^}]*--radius-xl/)
  expect(surfacesCss).toMatch(/\.tipBlock\s*{[^}]*border: 0[^}]*--radius-lg/)
  expect(surfacesCss.match(/border: var\(--space-outline-width\) solid/g)).toHaveLength(2)
})

test('the Care Team badge and the parent-proposed badge both carry text, and the review status follows it', () => {
  render(
    <>
      <SourceBadge source="careTeam" />
      <SourceBadge source="parentProposed" reviewStatus="Proposed" />
      <SourceBadge source="careTeam" label="Speech therapist" />
    </>,
  )
  expect(screen.getByText('Care Team')).toHaveAttribute('data-source', 'careTeam')
  expect(screen.getByText('Proposed by you · Proposed')).toHaveAttribute('data-source', 'parentProposed')
  expect(screen.getByText('Speech therapist')).toBeInTheDocument()
})

test('the AI label always reads "AI-suggested"', () => {
  render(<AiLabel />)
  expect(screen.getByText('AI-suggested')).toBeVisible()
})

test('the check tag carries the text and a decorative glyph, not colour alone', () => {
  render(<CheckTag />)
  const tag = screen.getByText('Please check this')
  expect(tag).toBeInTheDocument()
  expect(tag.querySelector('[aria-hidden="true"]')).not.toBeNull()
})

test('label colours come from the tokens and there is no shadow', () => {
  expect(labelsCss).not.toMatch(/box-shadow/)
  expect(labelsCss).toMatch(/--color-care-team-soft/)
  expect(labelsCss).toMatch(/--color-parent-proposed-soft/)
  expect(labelsCss).toMatch(/--color-attention-soft/)
})

test('any transition or animation in the controls and surfaces has a reduced-motion rule, so pressed states and sheets are instant', () => {
  const dirs = [import.meta.dirname, `${import.meta.dirname}/../ui`]
  for (const dir of dirs) {
    for (const file of readdirSync(dir).filter((name) => name.endsWith('.module.css'))) {
      const css = readFileSync(`${dir}/${file}`, 'utf8')
      if (/(^|\s)(transition|animation)\s*:/m.test(css)) expect(css, file).toMatch(/prefers-reduced-motion:\s*reduce/)
    }
  }
})
