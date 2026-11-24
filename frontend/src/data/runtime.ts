import { db } from './db.ts'
import { startLifecycle, type DataLifecycle } from './lifecycle.ts'
import { createOutbox } from './outbox.ts'
import { queryClient } from './queryClient.ts'
import { createDemoSession } from './session.ts'

/** The app's one session port. Story 3.1 replaces the demo implementation with the Keycloak one. */
export const session = createDemoSession()

let lifecycle: DataLifecycle | undefined
let stopOutbox: (() => void) | undefined

/** Resolves once Dexie holds only data owned by the current `sub`. */
export function whenReady(): Promise<void> {
  lifecycle ??= startLifecycle(session, db, queryClient)
  return lifecycle.whenReady()
}

export const outbox = createOutbox({ db, session, ready: whenReady })

/** Starts the session read, the ownership check and replay. Idempotent. Returns a stopper. */
export function startDataLayer(): () => void {
  if (!stopOutbox) {
    lifecycle ??= startLifecycle(session, db, queryClient)
    stopOutbox = outbox.start()
    void session.refresh()
  }
  return () => {
    stopOutbox?.()
    stopOutbox = undefined
    lifecycle?.stop()
    lifecycle = undefined
  }
}
