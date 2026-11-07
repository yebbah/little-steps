import { useSyncExternalStore } from 'react'
import { isModalOpen } from '../surfaces/modalLevel.ts'

// The install offer (Story 2.8, NFR-10, UX-DR129). Everything works uninstalled. A feature calls
// `offerInstall()` at a good moment (the first one is after the first saved Review, Epic 9); the Settings
// row "Add to home screen" calls it with `{ from: 'settings' }` and is the only way the offer returns after
// "Not now". The path is chosen by feature detection, never by browser name.

const DECLINED_KEY = 'littlesteps.install.declined'
const SESSIONS_KEY = 'littlesteps.install.sessions'
const COUNTED_KEY = 'littlesteps.install.counted'
const INSTALLED_KEY = 'littlesteps.install.installed'

/** The browser's own install prompt event (Chromium); other browsers never fire it. */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallOfferState = { open: false } | { open: true; mode: 'prompt' | 'instructions' }

let state: InstallOfferState = { open: false }
let deferredPrompt: BeforeInstallPromptEvent | null = null
let installed = false
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}
const set = (next: InstallOfferState) => {
  state = next
  listeners.forEach((listener) => listener())
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage can be blocked; the offer then simply may repeat.
  }
}

/** True when the app already runs from the home screen. Feature detection only. */
function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone), (display-mode: minimal-ui), (display-mode: fullscreen)').matches === true ||
    (navigator as { standalone?: boolean }).standalone === true
  )
}

/**
 * Counts a visit once per browser session (a tab's reloads are the same visit). A damaged stored value
 * counts as no visits, so an offer from a feature waits rather than showing early.
 */
function countVisit() {
  try {
    if (sessionStorage.getItem(COUNTED_KEY) === 'true') return
    sessionStorage.setItem(COUNTED_KEY, 'true')
  } catch {
    return
  }
  write(SESSIONS_KEY, String(visits() + 1))
}

function visits(): number {
  const count = Number(read(SESSIONS_KEY))
  return Number.isFinite(count) && count > 0 ? count : 0
}

/**
 * Starts listening for the browser's install events and counts this visit. Call once at start-up.
 * Returns a function that stops listening (for tests).
 */
export function startInstallTracking(): () => void {
  countVisit()
  // Once seen running from the home screen, remember it: later visits in a browser tab are not offered it again.
  if (isStandalone()) write(INSTALLED_KEY, 'true')
  const onPrompt = (event: Event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    // The event can arrive after the offer opened with instructions: switch to the browser's own prompt.
    if (state.open && state.mode === 'instructions') set({ open: true, mode: 'prompt' })
  }
  const onInstalled = () => {
    installed = true
    write(INSTALLED_KEY, 'true')
    deferredPrompt = null
    set({ open: false })
  }
  window.addEventListener('beforeinstallprompt', onPrompt)
  window.addEventListener('appinstalled', onInstalled)
  return () => {
    window.removeEventListener('beforeinstallprompt', onPrompt)
    window.removeEventListener('appinstalled', onInstalled)
  }
}

export interface OfferOptions {
  /** `settings` is the Caregiver asking for it: it ignores an earlier "Not now" and the first-visit rule. */
  from?: 'feature' | 'settings'
}

/**
 * Offers to add the app to the home screen. Returns whether an offer was shown. A feature call is
 * ignored on the very first visit, after "Not now", and when the app is already installed.
 */
export function offerInstall({ from = 'feature' }: OfferOptions = {}): boolean {
  if (installed || isStandalone() || read(INSTALLED_KEY) === 'true') return false
  // One modal level at a time: never open the offer behind another modal (it would be refused and read as "Not now").
  if (isModalOpen()) return false
  if (from === 'feature') {
    if (read(DECLINED_KEY) === 'true') return false
    if (visits() < 2) return false
  }
  set({ open: true, mode: deferredPrompt ? 'prompt' : 'instructions' })
  return true
}

/** The Caregiver chose "Add to home screen" in the offer, using the browser's own prompt. */
export async function acceptInstall(): Promise<void> {
  const event = deferredPrompt
  if (!event) {
    // The browser took its prompt back: fall back to the instructions instead of closing silently.
    set({ open: true, mode: 'instructions' })
    return
  }
  set({ open: false })
  deferredPrompt = null
  try {
    await event.prompt()
    const { outcome } = await event.userChoice
    if (outcome === 'dismissed') write(DECLINED_KEY, 'true')
  } catch {
    // The prompt can only be used once and needs a tap; if it fails, the Caregiver can ask again from Settings.
  }
}

/** "Not now", or closing the offer: it is not shown again unless the Caregiver asks from Settings. */
export function declineInstall(): void {
  write(DECLINED_KEY, 'true')
  set({ open: false })
}

export function useInstallOffer(): InstallOfferState {
  return useSyncExternalStore(subscribe, () => state)
}

/** For tests: back to a fresh page load. */
export function resetInstall(): void {
  state = { open: false }
  deferredPrompt = null
  installed = false
  listeners.forEach((listener) => listener())
}
