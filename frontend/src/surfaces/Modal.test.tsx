// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'
import { Dialog, Sheet } from './Modal.tsx'
import { readFileSync } from 'node:fs'

const modalCss = readFileSync(`${import.meta.dirname}/Modal.module.css`, 'utf8')
const FIRST = 'First'
const SHARE = 'Share'
const DIALOG_TITLE = 'Share this summary'
const DIALOG_TEXT = 'It will leave your family.'
const OPEN = 'Open sheet'
const OPEN_OTHER = 'Open dialog'
const TITLE = 'A few ideas to try'
const INSIDE = 'Inside'
const OUTSIDE = 'Outside'

function Host({ both = false }: { both?: boolean }) {
  const [open, setOpen] = useState(false)
  const [other, setOther] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>{OPEN}</button>
      {both ? <button onClick={() => setOther(true)}>{OPEN_OTHER}</button> : null}
      <p>{OUTSIDE}</p>
      <Sheet open={open} onOpenChange={setOpen} title={TITLE} footer={<button>{INSIDE}</button>}>
        <button>{FIRST}</button>
      </Sheet>
      <Dialog open={other} onOpenChange={setOther} title={DIALOG_TITLE} description={DIALOG_TEXT} actions={<button>{SHARE}</button>} />
    </>
  )
}

test('opening a sheet shows a modal dialog named by its heading, with focus on the heading', async () => {
  render(<Host />)
  await userEvent.click(screen.getByRole('button', { name: OPEN }))
  const dialog = screen.getByRole('dialog', { name: TITLE })
  expect(dialog).toHaveAttribute('aria-modal', 'true')
  expect(dialog).toHaveAttribute('aria-labelledby')
  expect(screen.getByRole('heading', { name: TITLE })).toHaveFocus()
})

test('Tab stays inside the sheet and wraps from the last control to the first', async () => {
  render(<Host />)
  await userEvent.click(screen.getByRole('button', { name: OPEN }))
  const dialog = screen.getByRole('dialog')
  const seen = new Set<Element>()
  for (let i = 0; i < 8; i++) {
    await userEvent.tab()
    expect(dialog.contains(document.activeElement)).toBe(true)
    seen.add(document.activeElement!)
  }
  expect(seen.size).toBeGreaterThan(1)
  await userEvent.tab({ shift: true })
  expect(dialog.contains(document.activeElement)).toBe(true)
})

test('Esc closes the sheet and returns focus to the invoker', async () => {
  render(<Host />)
  const invoker = screen.getByRole('button', { name: OPEN })
  await userEvent.click(invoker)
  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).toBeNull()
  await waitFor(() => expect(invoker).toHaveFocus())
})

test('when a click does not focus the button (Safari), focus still returns to the invoker (#154)', async () => {
  render(<Host />)
  const invoker = screen.getByRole('button', { name: OPEN })
  // fireEvent.click dispatches the click without focusing the button, as Safari does.
  fireEvent.click(invoker)
  expect(document.activeElement).not.toBe(invoker)
  await screen.findByRole('dialog')
  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).toBeNull()
  await waitFor(() => expect(invoker).toHaveFocus())
})

test('Close closes the sheet and returns focus to the invoker', async () => {
  render(<Host />)
  const invoker = screen.getByRole('button', { name: OPEN })
  await userEvent.click(invoker)
  await userEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  await waitFor(() => expect(invoker).toHaveFocus())
})

test('a tap on the scrim closes the sheet', async () => {
  render(<Host />)
  await userEvent.click(screen.getByRole('button', { name: OPEN }))
  const overlay = document.querySelector('[data-modal-root] > div')!
  await userEvent.click(overlay)
  expect(screen.queryByRole('dialog')).toBeNull()
})

test('a swipe down on the grabber closes the sheet and a short drag does not', async () => {
  render(<Host />)
  await userEvent.click(screen.getByRole('button', { name: OPEN }))
  const grabber = document.querySelector('[aria-hidden="true"][class*="grabber"]')!
  fireEvent.pointerDown(grabber, { clientY: 100, pointerId: 1 })
  fireEvent.pointerMove(grabber, { clientY: 140, pointerId: 1 })
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  fireEvent.pointerMove(grabber, { clientY: 200, pointerId: 1 })
  expect(screen.queryByRole('dialog')).toBeNull()
})

test('the page behind is inert while the sheet is open and is restored on close', async () => {
  const { container } = render(<Host />)
  await userEvent.click(screen.getByRole('button', { name: OPEN }))
  expect(container).toHaveAttribute('inert')
  expect(document.querySelector('[data-modal-root]')).not.toHaveAttribute('inert')
  await userEvent.keyboard('{Escape}')
  expect(container).not.toHaveAttribute('inert')
})

test('only one modal level opens: a second modal is refused and reports itself closed', async () => {
  render(<Host both />)
  await userEvent.click(screen.getByRole('button', { name: OPEN }))
  act(() => screen.getByRole('button', { name: OPEN_OTHER, hidden: true }).click())
  await act(async () => {})
  expect(screen.getAllByRole('dialog')).toHaveLength(1)
  expect(screen.getByRole('dialog')).toHaveAccessibleName(TITLE)
})

test('a dialog shows its heading, its sentence and its actions', async () => {
  render(<Host both />)
  await userEvent.click(screen.getByRole('button', { name: OPEN_OTHER }))
  const dialog = screen.getByRole('dialog', { name: 'Share this summary' })
  expect(dialog).toHaveAccessibleDescription('It will leave your family.')
  expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
})

test('a sheet without a description has no describedby', async () => {
  render(<Host />)
  await userEvent.click(screen.getByRole('button', { name: OPEN }))
  expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-describedby')
})

test('a refused modal stays closed after the first one closes, because it reported itself closed', async () => {
  render(<Host both />)
  await userEvent.click(screen.getByRole('button', { name: OPEN }))
  act(() => screen.getByRole('button', { name: OPEN_OTHER, hidden: true }).click())
  await act(async () => {})
  await userEvent.keyboard('{Escape}')
  await act(async () => {})
  expect(screen.queryByRole('dialog')).toBeNull()
})

function Handoff() {
  const [sheet, setSheet] = useState(false)
  const [dialog, setDialog] = useState(false)
  return (
    <>
      <button onClick={() => setSheet(true)}>{OPEN}</button>
      <Sheet open={sheet} onOpenChange={setSheet} title={TITLE}>
        <button
          onClick={() => {
            setSheet(false)
            setDialog(true)
          }}
        >
          {SHARE}
        </button>
      </Sheet>
      <Dialog open={dialog} onOpenChange={setDialog} title={DIALOG_TITLE} description={DIALOG_TEXT} actions={<button>{FIRST}</button>} />
    </>
  )
}

test('a sheet can hand off to a dialog in one action: the dialog shows and the page is not left inert without it', async () => {
  const { container } = render(<Handoff />)
  await userEvent.click(screen.getByRole('button', { name: OPEN }))
  await userEvent.click(screen.getByRole('button', { name: SHARE }))
  await act(async () => {})
  expect(screen.getByRole('dialog', { name: DIALOG_TITLE })).toBeInTheDocument()
  expect(container).toHaveAttribute('inert')
  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(container).not.toHaveAttribute('inert')
})

test('a dialog returns focus to its invoker on Esc, and a swipe-down close does too', async () => {
  render(<Host both />)
  const invokerDialog = screen.getByRole('button', { name: OPEN_OTHER })
  await userEvent.click(invokerDialog)
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(invokerDialog).toHaveFocus())

  const invokerSheet = screen.getByRole('button', { name: OPEN })
  await userEvent.click(invokerSheet)
  const grabber = document.querySelector('[aria-hidden="true"][class*="grabber"]')!
  fireEvent.pointerDown(grabber, { clientY: 100, pointerId: 1 })
  fireEvent.pointerMove(grabber, { clientY: 220, pointerId: 1 })
  await waitFor(() => expect(invokerSheet).toHaveFocus())
})

test('if the invoker is gone when the sheet closes, focus goes to the main landmark and not the body', async () => {
  function Gone() {
    const [open, setOpen] = useState(false)
    const [show, setShow] = useState(true)
    return (
      <main tabIndex={-1}>
        {show ? <button onClick={() => setOpen(true)}>{OPEN}</button> : null}
        <Sheet open={open} onOpenChange={setOpen} title={TITLE}>
          <button onClick={() => setShow(false)}>{SHARE}</button>
        </Sheet>
      </main>
    )
  }
  render(<Gone />)
  await userEvent.click(screen.getByRole('button', { name: OPEN }))
  await userEvent.click(screen.getByRole('button', { name: SHARE }))
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(screen.getByRole('main')).toHaveFocus())
})

test('the sheet stylesheet follows the spec: scrim, no shadow, height cap, 560px, reduced motion', () => {
  expect(modalCss).not.toMatch(/box-shadow/)
  expect(modalCss).toMatch(/--color-scrim/)
  expect(modalCss).toMatch(/max-height: calc\(100dvh - 24px\)/)
  expect(modalCss).toMatch(/max-width: 560px/)
  expect(modalCss).toMatch(/min-width: 600px/)
  expect(modalCss).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*{\s*\.content\s*{\s*animation: none/)
  expect(modalCss).toMatch(/--radius-xl\) var\(--radius-xl\) 0 0/)
})
