// @vitest-environment jsdom
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { routes } from './routes.tsx'
import { Screen } from './Screen.tsx'
import { useStatus } from './statusContext.ts'
import { FOCUS_KEY_ATTRIBUTE } from './useRouteFocus.ts'

const ANNOUNCE = 'announce'
const GO = 'go'
const FIELD = 'field'

function renderAt(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })
})
afterEach(() => vi.useRealTimers())

const frame = () => act(() => vi.advanceTimersByTime(20))

test('landmarks come in reading order: skip link, nav, main', () => {
  renderAt('/today')
  const skip = screen.getByRole('link', { name: 'Skip to content' })
  const nav = screen.getByRole('navigation', { name: 'Main' })
  const main = screen.getByRole('main')
  expect(skip.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(nav.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(document.querySelector('a, button, [tabindex]')).toBe(skip)
})

test('the skip link moves focus to main', async () => {
  renderAt('/today')
  await userEvent.setup({ advanceTimers: vi.advanceTimersByTime }).click(screen.getByRole('link', { name: 'Skip to content' }))
  expect(screen.getByRole('main')).toHaveFocus()
})

test('the nav has five destinations and marks the active one', () => {
  renderAt('/goals')
  const links = within(screen.getByRole('navigation')).getAllByRole('link')
  expect(links.map((l) => l.textContent)).toEqual(['Today', 'Goals', 'Activities', 'Share', 'Family'])
  expect(links.filter((l) => l.getAttribute('aria-current') === 'page').map((l) => l.textContent)).toEqual(['Goals'])
})

test('the first load redirects to Today, sets the title and leaves focus alone', () => {
  renderAt('/')
  expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
  expect(document.title).toBe("Today: Today's steps · LittleSteps")
  expect(screen.getByRole('heading', { level: 1 })).not.toHaveFocus()
})

test('selecting a destination sets the title and focuses the h1', async () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  renderAt('/today')
  await user.click(screen.getByRole('link', { name: 'Goals' }))
  expect(document.title).toBe('Goals: Your goals · LittleSteps')
  expect(screen.getByRole('heading', { level: 1, name: 'Goals' })).toHaveFocus()
  expect(screen.getByRole('link', { name: 'Goals' })).toHaveAttribute('aria-current', 'page')
})

test('an unknown path shows a not-found screen with the same rules', () => {
  renderAt('/nope')
  expect(screen.getByRole('heading', { level: 1, name: "We can't find that page" })).toBeInTheDocument()
  expect(document.title).toBe("We can't find that page: Page not found · LittleSteps")
  expect(screen.getByRole('link', { name: 'Go to Today' })).toHaveAttribute('href', '/today')
})

test('there is exactly one empty status region outside main', () => {
  renderAt('/today')
  const region = screen.getByRole('status')
  expect(region).toBeEmptyDOMElement()
  expect(screen.getAllByRole('status')).toHaveLength(1)
  expect(within(screen.getByRole('main')).queryByRole('status')).toBeNull()
})

function Announcer({ message }: { message: string }) {
  const { announce } = useStatus()
  return <button onClick={() => announce(message)}>{ANNOUNCE}</button>
}

test('announce sets the region text on the next frame and ignores an empty message', async () => {
  const router = createMemoryRouter(
    [{ element: routes[0].element, children: [{ path: '/x', element: <Announcer message="Saved." />, handle: { screenKey: 'nav.today', subjectKey: 'screen.today.subject' } }, { path: '/y', element: <Announcer message="" /> }] }],
    { initialEntries: ['/x'] },
  )
  render(<RouterProvider router={router} />)
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  await user.click(screen.getByRole('button', { name: 'announce' }))
  expect(screen.getByRole('status')).toBeEmptyDOMElement()
  frame()
  expect(screen.getByRole('status')).toHaveTextContent('Saved.')
  await act(() => router.navigate('/y'))
  await user.click(screen.getByRole('button', { name: 'announce' }))
  frame()
  expect(screen.getByRole('status')).toHaveTextContent('Saved.')
})

test('a message announced with a navigation goes out after focus is on the h1', async () => {
  function Go() {
    const { announce } = useStatus()
    return (
      <a
        href="/goals"
        onClick={(e) => {
          e.preventDefault()
          announce('Review saved.')
          void router.navigate('/goals')
        }}
      >
        {GO}
      </a>
    )
  }
  const router = createMemoryRouter(
    [{ element: routes[0].element, children: [{ path: '/', element: <Go /> }, routes[0].children![2]] }],
    { initialEntries: ['/'] },
  )
  render(<RouterProvider router={router} />)
  await userEvent.setup({ advanceTimers: vi.advanceTimersByTime }).click(screen.getByRole('link', { name: 'go' }))
  expect(screen.getByRole('heading', { level: 1, name: 'Goals' })).toHaveFocus()
  expect(screen.getByRole('status')).toBeEmptyDOMElement()
  frame()
  expect(screen.getByRole('status')).toHaveTextContent('Review saved.')
})

test('Back returns to the previous screen and restores focus to the element that had it', async () => {
  function WithField() {
    return (
      <>
        <Screen titleKey="nav.today" introKey="screen.today.intro" />
        <button {...{ [FOCUS_KEY_ATTRIBUTE]: 'field' }}>{FIELD}</button>
      </>
    )
  }
  const router = createMemoryRouter(
    [
      {
        element: routes[0].element,
        children: [
          { path: '/today', element: <WithField />, handle: { screenKey: 'nav.today', subjectKey: 'screen.today.subject' } },
          routes[0].children![2],
        ],
      },
    ],
    { initialEntries: ['/today'] },
  )
  render(<RouterProvider router={router} />)
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  await user.click(screen.getByRole('button', { name: 'field' }))
  await user.click(screen.getByRole('link', { name: 'Goals' }))
  expect(screen.getByRole('heading', { level: 1, name: 'Goals' })).toHaveFocus()
  await act(() => router.navigate(-1))
  expect(screen.getByRole('button', { name: 'field' })).toHaveFocus()
  expect(document.title).toBe("Today: Today's steps · LittleSteps")
})

test('Back falls back to the h1 when nothing was focused in the content', async () => {
  const router = renderAt('/today')
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  await user.click(screen.getByRole('link', { name: 'Goals' }))
  await act(() => router.navigate(-1))
  expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toHaveFocus()
})

test('an identical message announced twice is delivered twice', async () => {
  const router = createMemoryRouter(
    [{ element: routes[0].element, children: [{ path: '/x', element: <Announcer message="Saved." />, handle: { screenKey: 'nav.today', subjectKey: 'screen.today.subject' } }] }],
    { initialEntries: ['/x'] },
  )
  render(<RouterProvider router={router} />)
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  const seen: string[] = []
  new MutationObserver(() => seen.push(screen.getByRole('status').textContent ?? '')).observe(screen.getByRole('status'), { childList: true, characterData: true, subtree: true })
  await user.click(screen.getByRole('button', { name: ANNOUNCE }))
  frame()
  await user.click(screen.getByRole('button', { name: ANNOUNCE }))
  frame()
  await act(async () => {})
  expect(seen.filter((text) => text === 'Saved.')).toHaveLength(2)
})

test('a message announced while a loader is pending waits until the new screen has focus', async () => {
  let release!: () => void
  const gate = new Promise<void>((resolve) => (release = resolve))
  function Go() {
    const { announce } = useStatus()
    return (
      <a
        href="/goals"
        onClick={(e) => {
          e.preventDefault()
          void router.navigate('/goals')
          announce('Review saved.')
        }}
      >
        {GO}
      </a>
    )
  }
  const goals = { ...routes[0].children![2], loader: () => gate.then(() => null) }
  const router = createMemoryRouter([{ element: routes[0].element, children: [{ path: '/', element: <Go /> }, goals] }], { initialEntries: ['/'] })
  render(<RouterProvider router={router} />)
  await userEvent.setup({ advanceTimers: vi.advanceTimersByTime }).click(screen.getByRole('link', { name: GO }))
  frame()
  expect(screen.getByRole('status')).toBeEmptyDOMElement()
  await act(async () => release())
  expect(screen.getByRole('heading', { level: 1, name: 'Goals' })).toHaveFocus()
  frame()
  expect(screen.getByRole('status')).toHaveTextContent('Review saved.')
})
