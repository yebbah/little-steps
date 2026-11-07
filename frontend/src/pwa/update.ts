import { useSyncExternalStore } from 'react'

// The update hook (Story 2.8). A new app version is downloaded in the background and waits; it takes over
// on the next open, so nothing reloads under a Caregiver mid-entry. Later epics that hold drafts call
// `applyUpdate()` only when no draft is open (or never: the next open is enough).
let updateReady = false
let applyUpdate: () => void = () => {}
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}
const notify = () => listeners.forEach((listener) => listener())

/** Called by the service worker registration when a new version is waiting. */
export function markUpdateReady(apply: () => void): void {
  updateReady = true
  applyUpdate = apply
  notify()
}

/** For tests: forget any waiting update. */
export function resetUpdate(): void {
  updateReady = false
  applyUpdate = () => {}
  notify()
}

export interface AppUpdate {
  /** True when a new version has been downloaded and is waiting for the next open. */
  updateReady: boolean
  /** Reloads onto the waiting version now. Call it only when no draft is in progress. */
  applyUpdate: () => void
}

export function useAppUpdate(): AppUpdate {
  const ready = useSyncExternalStore(subscribe, () => updateReady)
  return { updateReady: ready, applyUpdate: () => applyUpdate() }
}
