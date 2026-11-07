// @vitest-environment jsdom
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { useState } from 'react'
import { Sheet } from '../surfaces/Modal.tsx'
import { InstallOffer } from './InstallOffer.tsx'
import { acceptInstall, offerInstall, resetInstall, startInstallTracking, type BeforeInstallPromptEvent } from './install.ts'

let stop = () => {}
let standalone = false

function promptEvent(outcome: 'accepted' | 'dismissed') {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as BeforeInstallPromptEvent
  event.prompt = vi.fn().mockResolvedValue(undefined)
  event.userChoice = Promise.resolve({ outcome })
  return event
}

/** A page load: counts the visit and starts listening. */
const loadPage = () => {
  stop()
  resetInstall()
  stop = startInstallTracking()
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  standalone = false
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: standalone && query.includes('standalone'), addEventListener() {}, removeEventListener() {} }))
  loadPage()
})
afterEach(() => {
  stop()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  sessionStorage.clear()
})

const ask = (options?: Parameters<typeof offerInstall>[0]) => {
  let shown = false
  act(() => {
    shown = offerInstall(options)
  })
  return shown
}

/** A new browser session: the visit is counted again. */
const secondVisit = () => {
  sessionStorage.clear()
  loadPage()
}

test('it is never shown on the first visit, even when a feature asks', () => {
  render(<InstallOffer />)
  expect(ask()).toBe(false)
  expect(screen.queryByRole('dialog')).toBeNull()
})

test('prompt path: where the browser has its own prompt, "Add to home screen" opens it', async () => {
  secondVisit()
  const event = promptEvent('accepted')
  window.dispatchEvent(event)
  expect(event.defaultPrevented).toBe(true)
  render(<InstallOffer />)
  act(() => void offerInstall())
  const dialog = screen.getByRole('dialog', { name: 'Add LittleSteps to your home screen' })
  expect(dialog).toHaveAccessibleDescription('It opens like an app, and everything still works in your browser.')
  await userEvent.click(screen.getByRole('button', { name: 'Add to home screen' }))
  expect(event.prompt).toHaveBeenCalledOnce()
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  // Accepting is not "Not now": a later feature call may still ask once the browser offers it again.
  expect(localStorage.getItem('littlesteps.install.declined')).toBeNull()
})

test('prompt path: dismissing the browser prompt counts as "Not now"', async () => {
  secondVisit()
  window.dispatchEvent(promptEvent('dismissed'))
  render(<InstallOffer />)
  act(() => void offerInstall())
  await userEvent.click(screen.getByRole('button', { name: 'Add to home screen' }))
  await waitFor(() => expect(localStorage.getItem('littlesteps.install.declined')).toBe('true'))
  expect(ask()).toBe(false)
})

test('instructions path: with no browser prompt it shows short instructions and names no browser', async () => {
  secondVisit()
  render(<InstallOffer />)
  act(() => void offerInstall())
  const dialog = screen.getByRole('dialog')
  expect(dialog).toHaveAccessibleDescription(/Add to Home Screen or Install/)
  expect(dialog.textContent).not.toMatch(/Safari|Firefox|Chrome|Edge|iOS|Android/)
  expect(screen.queryByRole('button', { name: 'Add to home screen' })).toBeNull()
  await userEvent.click(screen.getByRole('button', { name: 'Got it' }))
  expect(screen.queryByRole('dialog')).toBeNull()
})

test('"Not now" closes the offer and a feature call never shows it again', async () => {
  secondVisit()
  window.dispatchEvent(promptEvent('accepted'))
  render(<InstallOffer />)
  act(() => void offerInstall())
  await userEvent.click(screen.getByRole('button', { name: 'Not now' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(ask()).toBe(false)
  secondVisit()
  expect(ask()).toBe(false)
})

test('Closing the offer with Close counts as "Not now"', async () => {
  secondVisit()
  render(<InstallOffer />)
  act(() => void offerInstall())
  await userEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(ask()).toBe(false)
})

test('the Settings row brings the offer back after "Not now", and on a first visit', async () => {
  secondVisit()
  render(<InstallOffer />)
  act(() => void offerInstall())
  await userEvent.click(screen.getByRole('button', { name: 'Got it' }))
  expect(ask({ from: 'settings' })).toBe(true)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})

test('nothing is offered when the app already runs from the home screen', () => {
  secondVisit()
  standalone = true
  expect(ask({ from: 'settings' })).toBe(false)
})

test('nothing is offered after the browser reports the app installed', () => {
  secondVisit()
  window.dispatchEvent(new Event('appinstalled'))
  expect(ask({ from: 'settings' })).toBe(false)
})

test('accepting with no stored prompt does nothing and does not throw', async () => {
  await expect(acceptInstall()).resolves.toBeUndefined()
})

test('blocked storage: a feature offer waits (it cannot know the visit count), Settings still works', () => {
  secondVisit()
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  expect(ask()).toBe(false)
  expect(ask({ from: 'settings' })).toBe(true)
})

test('a reload in the same session is the same visit, so the offer still waits for a second one', () => {
  stop()
  resetInstall()
  stop = startInstallTracking()
  stop()
  resetInstall()
  stop = startInstallTracking()
  expect(ask()).toBe(false)
})

test('a damaged visit count never shows the offer early', () => {
  secondVisit()
  localStorage.setItem('littlesteps.install.sessions', 'abc')
  expect(ask()).toBe(false)
})

test('on iOS the app is installed when navigator.standalone is true', () => {
  secondVisit()
  vi.stubGlobal('navigator', { ...navigator, standalone: true })
  expect(ask({ from: 'settings' })).toBe(false)
})

test('a browser prompt that fails when used does not throw and does not leave the dialog open', async () => {
  secondVisit()
  const event = promptEvent('accepted')
  event.prompt = vi.fn().mockRejectedValue(new Error('already used'))
  window.dispatchEvent(event)
  render(<InstallOffer />)
  act(() => void offerInstall())
  await userEvent.click(screen.getByRole('button', { name: 'Add to home screen' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})

test('after the prompt was used, a Settings offer falls back to the instructions', async () => {
  secondVisit()
  window.dispatchEvent(promptEvent('accepted'))
  render(<InstallOffer />)
  act(() => void offerInstall())
  await userEvent.click(screen.getByRole('button', { name: 'Add to home screen' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  act(() => void offerInstall({ from: 'settings' }))
  expect(screen.getByRole('dialog')).toHaveAccessibleDescription(/Add to Home Screen or Install/)
})

test('if the browser prompt arrives after the offer opened with instructions, the offer switches to it', () => {
  secondVisit()
  render(<InstallOffer />)
  act(() => void offerInstall())
  expect(screen.queryByRole('button', { name: 'Add to home screen' })).toBeNull()
  act(() => {
    window.dispatchEvent(promptEvent('accepted'))
  })
  expect(screen.getByRole('button', { name: 'Add to home screen' })).toBeInTheDocument()
})

test('an offer is not opened behind another modal, and that is not recorded as "Not now"', () => {
  secondVisit()
  function Other() {
    const [open, setOpen] = useState(true)
    return <Sheet open={open} onOpenChange={setOpen} title="Another" />
  }
  render(
    <>
      <Other />
      <InstallOffer />
    </>,
  )
  expect(ask()).toBe(false)
  expect(localStorage.getItem('littlesteps.install.declined')).toBeNull()
})

test('an app seen running from the home screen is never offered again in a browser tab', () => {
  standalone = true
  loadPage()
  standalone = false
  secondVisit()
  expect(ask({ from: 'settings' })).toBe(false)
})
