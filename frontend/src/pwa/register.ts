import { registerSW } from 'virtual:pwa-register'
import { markUpdateReady } from './update.ts'

/**
 * Registers the service worker (production builds only: the dev server and the test-mode gallery run
 * without one). A waiting version is announced to the update hook and is never applied on its own.
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return
  const updateSW = registerSW({
    onNeedRefresh() {
      markUpdateReady(() => void updateSW(true))
    },
    // The app works without a service worker; a failed registration is not an error to the Caregiver.
    onRegisterError() {},
  })
}
