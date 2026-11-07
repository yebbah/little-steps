// @vitest-environment jsdom
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { resetInstall, startInstallTracking } from '../pwa/install.ts'
import { routes } from './routes.tsx'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const view = render(<RouterProvider router={router} />)
  return { router, view }
}

const frame = () => act(() => vi.advanceTimersByTime(20))
let stop = () => {}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })
})
afterEach(() => {
  vi.restoreAllMocks()
  stop()
  resetInstall()
  vi.useRealTimers()
  document.documentElement.removeAttribute('data-theme')
})

test('Family opens Settings, which has an h1, the Story 2.3 title format and the Family nav item current', async () => {
  const user = userEvent.setup({ delay: null })
  renderAt('/family')
  expect(screen.getByRole('heading', { level: 1, name: 'Family' })).toBeInTheDocument()
  await user.click(screen.getByRole('link', { name: 'Settings' }))
  expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toHaveFocus()
  expect(document.title).toBe('Settings: Looks and install · LittleSteps')
  expect(within(screen.getByRole('navigation')).getByRole('link', { name: 'Family' })).toHaveAttribute('aria-current', 'page')
})

test('Back returns to Family and puts focus on the Family heading', async () => {
  const user = userEvent.setup({ delay: null })
  const { router } = renderAt('/family')
  await user.click(screen.getByRole('link', { name: 'Settings' }))
  await user.click(screen.getByRole('link', { name: 'Back to Family' }))
  expect(router.state.location.pathname).toBe('/family')
  expect(screen.getByRole('heading', { level: 1, name: 'Family' })).toHaveFocus()
})

test('the theme defaults to System and offers Light, Dark and System as chips', () => {
  renderAt('/family/settings')
  const group = screen.getByRole('group', { name: 'Theme' })
  expect(within(group).getAllByRole('radio').map((r) => (r as HTMLInputElement).value)).toEqual(['light', 'dark', 'system'])
  expect(within(group).getByRole('radio', { name: 'System' })).toBeChecked()
  expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
})

test('choosing Dark applies it at once with no reload, and stores it on the device', async () => {
  const user = userEvent.setup({ delay: null })
  renderAt('/family/settings')
  await user.click(screen.getByRole('radio', { name: 'Dark' }))
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  expect(localStorage.getItem('littlesteps.theme')).toBe('dark')
  await user.click(screen.getByRole('radio', { name: 'Light' }))
  expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  await user.click(screen.getByRole('radio', { name: 'System' }))
  expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  expect(localStorage.getItem('littlesteps.theme')).toBeNull()
})

test('the stored choice is shown after a reload', async () => {
  const user = userEvent.setup({ delay: null })
  const first = renderAt('/family/settings')
  await user.click(screen.getByRole('radio', { name: 'Dark' }))
  first.view.unmount()
  // A reload: the page loses what was applied, and index.html's inline script applies the stored choice again.
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.setAttribute('data-theme', localStorage.getItem('littlesteps.theme')!)
  renderAt('/family/settings')
  expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked()
  expect(localStorage.getItem('littlesteps.theme')).toBe('dark')
})

test('the change is announced through the shell status region, once per choice', async () => {
  const user = userEvent.setup({ delay: null })
  renderAt('/family/settings')
  expect(screen.getByRole('status')).toBeEmptyDOMElement()
  await user.click(screen.getByRole('radio', { name: 'Dark' }))
  frame()
  expect(screen.getByRole('status')).toHaveTextContent('Theme set to Dark.')
  expect(screen.getAllByRole('status')).toHaveLength(1)
  await user.click(screen.getByRole('radio', { name: 'System' }))
  frame()
  expect(screen.getByRole('status')).toHaveTextContent('Theme set to System.')
})

test('blocked storage still applies the choice for this visit', async () => {
  const user = userEvent.setup({ delay: null })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  renderAt('/family/settings')
  await user.click(screen.getByRole('radio', { name: 'Dark' }))
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
})

test('with blocked storage the chip still shows the theme the page is in when Settings is opened again', async () => {
  const user = userEvent.setup({ delay: null })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  const first = renderAt('/family/settings')
  await user.click(screen.getByRole('radio', { name: 'Dark' }))
  first.view.unmount()
  renderAt('/family/settings')
  expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked()
})

test('"Add to home screen" opens the install offer, even after "Not now"', async () => {
  const user = userEvent.setup({ delay: null })
  localStorage.setItem('littlesteps.install.declined', 'true')
  stop = startInstallTracking()
  renderAt('/family/settings')
  await user.click(screen.getByRole('button', { name: 'Add to home screen' }))
  expect(screen.getByRole('dialog', { name: 'Add LittleSteps to your home screen' })).toBeInTheDocument()
})

test('Settings holds only the theme choice and the install row for now (no Reminders, no Privacy)', () => {
  renderAt('/family/settings')
  const main = within(screen.getByRole('main'))
  expect(main.getAllByRole('group').map((g) => g.querySelector('legend')?.textContent)).toEqual(['Theme'])
  expect(main.getAllByRole('button').map((b) => b.textContent)).toEqual(['Add to home screen'])
  expect(main.getAllByRole('heading')).toHaveLength(1)
})

test('choosing the chip that is already selected does not announce or store again', async () => {
  const user = userEvent.setup({ delay: null })
  renderAt('/family/settings')
  await user.click(screen.getByRole('radio', { name: 'System' }))
  frame()
  expect(screen.getByRole('status')).toBeEmptyDOMElement()
})

test('when the app is already on the home screen the row says so instead of doing nothing', async () => {
  const user = userEvent.setup({ delay: null })
  localStorage.setItem('littlesteps.install.installed', 'true')
  renderAt('/family/settings')
  await user.click(screen.getByRole('button', { name: 'Add to home screen' }))
  frame()
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(screen.getByRole('status')).toHaveTextContent('LittleSteps is already on your home screen.')
})

test('when the offer cannot open for another reason the row says install is unavailable, not that the app is installed', async () => {
  const user = userEvent.setup({ delay: null })
  renderAt('/family/settings')
  await user.click(screen.getByRole('radio', { name: 'Dark' }))
  const { Sheet } = await import('../surfaces/Modal.tsx')
  render(<Sheet open onOpenChange={() => {}} title="Another" />)
  // The page behind an open modal takes no pointer input, so the press is made directly.
  act(() => screen.getByRole('button', { name: 'Add to home screen', hidden: true }).click())
  frame()
  expect(screen.getByRole('status', { hidden: true })).toHaveTextContent('Install is not available right now')
})
