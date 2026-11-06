// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { DisclosureRow } from './DisclosureRow.tsx'

const BODY = 'Panel text'

test('a click toggles aria-expanded, and aria-controls names the panel', async () => {
  render(
    <DisclosureRow label="If it gets hard">
      <p>{BODY}</p>
    </DisclosureRow>,
  )
  const row = screen.getByRole('button', { name: 'If it gets hard' })
  const panel = document.getElementById(row.getAttribute('aria-controls') ?? '')
  expect(panel).not.toBeNull()
  expect(row).toHaveAttribute('aria-expanded', 'false')
  expect(panel).not.toBeVisible()

  await userEvent.click(row)
  expect(row).toHaveAttribute('aria-expanded', 'true')
  expect(panel).toBeVisible()

  await userEvent.click(row)
  expect(row).toHaveAttribute('aria-expanded', 'false')
})

test('Enter and Space toggle it from the keyboard', async () => {
  render(
    <DisclosureRow label="Earlier goals" edge="solid" defaultExpanded>
      <p>{BODY}</p>
    </DisclosureRow>,
  )
  const row = screen.getByRole('button', { name: 'Earlier goals' })
  expect(row).toHaveAttribute('aria-expanded', 'true')
  row.focus()
  await userEvent.keyboard('{Enter}')
  expect(row).toHaveAttribute('aria-expanded', 'false')
  await userEvent.keyboard(' ')
  expect(row).toHaveAttribute('aria-expanded', 'true')
})
