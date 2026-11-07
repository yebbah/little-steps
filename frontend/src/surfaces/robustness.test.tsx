// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'
import { Banner } from './Banner.tsx'
import { firstWords } from './firstWords.ts'
import { SourceBadge } from './Labels.tsx'
import { Sheet } from './Modal.tsx'

const OPEN = 'Open'
// Epic 2 code review: edge cases of the surfaces.

test('dismissing a banner moves focus to the main landmark, so it never falls to the page body', async () => {
  function Host() {
    const [shown, setShown] = useState(true)
    return (
      <main tabIndex={-1}>
        {shown ? <Banner message="Saved on this device — will sync." onDismiss={() => setShown(false)} /> : null}
      </main>
    )
  }
  render(<Host />)
  await userEvent.click(screen.getByRole('button', { name: /Dismiss notice/ }))
  expect(screen.getByRole('main')).toHaveFocus()
})

test('dismissing a banner while a modal is open does not try to focus the inert page', async () => {
  function Host() {
    const [open, setOpen] = useState(true)
    return (
      <>
        <main tabIndex={-1}>
          <Banner message="Offline notice here" onDismiss={() => {}} />
        </main>
        <Sheet open={open} onOpenChange={setOpen} title="Sheet" />
      </>
    )
  }
  render(<Host />)
  // The page behind an open modal takes no pointer input, so the press is made directly.
  act(() => screen.getByRole('button', { name: /Dismiss notice/, hidden: true }).click())
  expect(screen.getByRole('main', { hidden: true })).not.toHaveFocus()
})

test('the dismiss label never cuts a character made of two code units in half', () => {
  const label = firstWords('😀'.repeat(60))
  expect([...label]).toHaveLength(40)
  expect(label).toBe('😀'.repeat(40))
})

test('a source badge with an empty label falls back to the catalog text', () => {
  render(<SourceBadge source="careTeam" label="" />)
  expect(screen.getByText('Care Team')).toBeInTheDocument()
})

test('a sheet opened with nothing focused does not send focus back to an earlier invoker', async () => {
  function Host() {
    const [open, setOpen] = useState(false)
    return (
      <main tabIndex={-1}>
        <button onClick={() => setOpen(true)}>{OPEN}</button>
        <Sheet open={open} onOpenChange={setOpen} title="Sheet" />
      </main>
    )
  }
  render(<Host />)
  const first = screen.getByRole('button', { name: OPEN })
  await userEvent.click(first)
  await userEvent.keyboard('{Escape}')
  await screen.findByRole('button', { name: OPEN })
  expect(first).toHaveFocus()
})
