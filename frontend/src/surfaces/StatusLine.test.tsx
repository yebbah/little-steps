// @vitest-environment jsdom
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createMemoryRouter, RouterProvider, useNavigate } from 'react-router'
import { routes } from '../shell/routes.tsx'
import { Screen } from '../shell/Screen.tsx'
import { StatusLine } from './StatusLine.tsx'
import { useStatusLine } from './statusLineContext.ts'
import { useUndo } from './useUndo.ts'

const providerSource = readFileSync(`${import.meta.dirname}/StatusLineProvider.tsx`, 'utf8')
const EMPTY = 'empty'
const SHOW = 'show'
const SHOW_UNDO = 'show undo'
const SHOW_AND_GO = 'show and go'
const PLAIN = 'plain button'
const SAVED = 'Review saved.'
const SWAPPED = 'Swapped for Blocks · Undo'
const MARK = 'mark it'

let undone = 0
let performed = 0

function Actions() {
  const { show } = useStatusLine()
  const navigate = useNavigate()
  const undoable = useUndo()
  return (
    <>
      <Screen titleKey="nav.today" introKey="screen.today.intro" />
      <button onClick={() => show(SAVED)}>{SHOW}</button>
      <button onClick={() => show(SWAPPED, { onUndo: () => undone++ })}>{SHOW_UNDO}</button>
      <button
        onClick={() => {
          show(SAVED)
          void navigate('/goals')
        }}
      >
        {SHOW_AND_GO}
      </button>
      <button onClick={() => show('')}>{EMPTY}</button>
      <button onClick={() => undoable({ perform: () => performed++, undo: () => undone++, message: 'Mark saved: Waved · Undo' })}>{MARK}</button>
      <button>{PLAIN}</button>
    </>
  )
}

function setup() {
  const router = createMemoryRouter(
    [
      {
        element: routes[0].element,
        children: [{ path: '/today', element: <Actions />, handle: { screenKey: 'nav.today', subjectKey: 'screen.today.subject' } }, routes[0].children![2]],
      },
    ],
    { initialEntries: ['/today'] },
  )
  render(<RouterProvider router={router} />)
  return { router, user: userEvent.setup({ delay: null }) }
}

const frame = () => act(() => vi.advanceTimersByTime(20))
const line = () => document.querySelector('[data-status-line]')

beforeEach(() => {
  undone = 0
  performed = 0
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })
})
afterEach(() => vi.useRealTimers())

test('the line appears under the h1, and the message is announced once through the shell region', async () => {
  const { user } = setup()
  expect(line()).toBeNull()
  await user.click(screen.getByRole('button', { name: SHOW }))
  const visible = line()!
  expect(visible).toHaveTextContent(SAVED)
  const heading = screen.getByRole('heading', { level: 1 })
  expect(heading.compareDocumentPosition(visible) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  frame()
  expect(screen.getByRole('status')).toHaveTextContent(SAVED)
  expect(screen.getAllByRole('status')).toHaveLength(1)
  expect(visible.querySelector('[role="status"], [aria-live]')).toBeNull()
})

test('empty text is ignored', async () => {
  const { user } = setup()
  await user.click(screen.getByRole('button', { name: EMPTY }))
  expect(line()).toBeNull()
})

test('Undo shows the text without the catalog suffix, calls the handler once and clears the line', async () => {
  const { user } = setup()
  await user.click(screen.getByRole('button', { name: SHOW_UNDO }))
  expect(line()).toHaveTextContent('Swapped for Blocks')
  expect(line()!.textContent).not.toContain('· Undo')
  await user.click(within(line() as HTMLElement).getByRole('button', { name: 'Undo' }))
  expect(undone).toBe(1)
  expect(line()).toBeNull()
})

test('the line does not clear on a timer', async () => {
  const { user } = setup()
  await user.click(screen.getByRole('button', { name: SHOW }))
  // Real time passes (only animation frames are faked) and the provider owns no timer at all.
  await act(() => new Promise((resolve) => setTimeout(resolve, 400)))
  act(() => vi.advanceTimersByTime(10 * 60 * 1000))
  expect(line()).toHaveTextContent(SAVED)
  expect(providerSource).not.toMatch(/setTimeout|setInterval/)
})

test('the next click outside the line clears it', async () => {
  const { user } = setup()
  await user.click(screen.getByRole('button', { name: SHOW }))
  await user.click(screen.getByRole('button', { name: PLAIN }))
  expect(line()).toBeNull()
})

test('the next key press clears it, but Tab alone does not', async () => {
  const { user } = setup()
  await user.click(screen.getByRole('button', { name: SHOW }))
  await user.tab()
  expect(line()).toHaveTextContent(SAVED)
  await user.keyboard('a')
  expect(line()).toBeNull()
})

test('the line survives the navigation its own action caused, and clears on the next navigation', async () => {
  const { user, router } = setup()
  await user.click(screen.getByRole('button', { name: SHOW_AND_GO }))
  expect(screen.getByRole('heading', { level: 1, name: 'Goals' })).toBeInTheDocument()
  expect(line()).toHaveTextContent(SAVED)
  await act(() => router.navigate('/today'))
  expect(line()).toBeNull()
})

test('a link click that is a new action clears the line', async () => {
  const { user } = setup()
  await user.click(screen.getByRole('button', { name: SHOW }))
  await user.click(screen.getByRole('link', { name: 'Goals' }))
  expect(line()).toBeNull()
})

test('the useUndo helper performs the action, shows the line with Undo, and Undo reverses it', async () => {
  const { user } = setup()
  await user.click(screen.getByRole('button', { name: MARK }))
  expect(performed).toBe(1)
  expect(line()).toHaveTextContent('Mark saved: Waved')
  await user.click(screen.getByRole('button', { name: 'Undo' }))
  expect(undone).toBe(1)
  expect(performed).toBe(1)
})

test('the Undo lasts until the next action, not a fixed time', async () => {
  const { user } = setup()
  await user.click(screen.getByRole('button', { name: MARK }))
  await act(() => new Promise((resolve) => setTimeout(resolve, 400)))
  expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: PLAIN }))
  expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull()
})

test('a back navigation (popstate) is a user action and clears the line', async () => {
  const { user } = setup()
  await user.click(screen.getByRole('button', { name: SHOW }))
  act(() => {
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
  expect(line()).toBeNull()
})

test('an Undo that shows its own line keeps that line', async () => {
  function Self() {
    const { show } = useStatusLine()
    return (
      <>
        <StatusLine />
        <button onClick={() => show('First · Undo', { onUndo: () => show('Undone.') })}>{SHOW}</button>
      </>
    )
  }
  const router = createMemoryRouter([{ element: routes[0].element, children: [{ path: '/today', element: <Self />, handle: { screenKey: 'nav.today', subjectKey: 'screen.today.subject' } }] }], { initialEntries: ['/today'] })
  render(<RouterProvider router={router} />)
  const user = userEvent.setup({ delay: null })
  await user.click(screen.getByRole('button', { name: SHOW }))
  await user.click(screen.getByRole('button', { name: 'Undo' }))
  expect(line()).toHaveTextContent('Undone.')
})

test('after Undo removes its button, focus moves to the main landmark', async () => {
  const { user } = setup()
  await user.click(screen.getByRole('button', { name: SHOW_UNDO }))
  await user.click(screen.getByRole('button', { name: 'Undo' }))
  expect(screen.getByRole('main')).toHaveFocus()
})
