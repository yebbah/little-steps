// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { DomainTag } from './DomainTag.tsx'

test('[P1] the label is shown and the tint is the Domain token for its family', () => {
  render(<DomainTag domain="Speech and language" />)
  const tag = screen.getByText('Speech and language')
  expect(tag).toHaveAttribute('data-tint', 'communication')
  expect(tag.style.background).toBe('var(--color-domain-communication)')
})

test('[P1] an unmatched Domain still shows its own label on the other tint', () => {
  render(<DomainTag domain="Cooking" />)
  const tag = screen.getByText('Cooking')
  expect(tag).toHaveAttribute('data-tint', 'other')
  expect(tag.style.background).toBe('var(--color-domain-other)')
})
