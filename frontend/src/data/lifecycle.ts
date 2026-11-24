import type { QueryClient } from '@tanstack/react-query'
import type { LittleStepsDb } from './db.ts'
import type { SessionPort } from './session.ts'

const OWNER = 'owner'

export interface DataLifecycle {
  /**
   * Resolves once the session has answered and Dexie holds only data owned by the current `sub`. Anything
   * that shows or replays stored data awaits this first.
   */
  whenReady: () => Promise<void>
  /** Stops listening to the session. */
  stop: () => void
}

/**
 * Keeps Dexie and the Query cache tied to one `sub`. When the session reports a `sub` other than the one that
 * owns the stored data, the outbox, drafts and snapshot are wiped and the Query cache is cleared, before
 * `whenReady` resolves. A session with no `sub` (not signed in, or a 401) wipes nothing: the queue is kept.
 */
export function startLifecycle(session: SessionPort, db: LittleStepsDb, queryClient: QueryClient): DataLifecycle {
  let busy = false
  // undefined: not reconciled yet. null: reconciled with nobody signed in.
  let reconciledSub: string | null | undefined
  let lastSub: string | null = null
  const waiters = new Set<() => void>()
  const notify = () => waiters.forEach((w) => w())

  async function reconcile(sub: string | null): Promise<void> {
    if (sub === null) return
    if (lastSub !== null && lastSub !== sub) queryClient.clear()
    lastSub = sub
    try {
      const owner = await db.meta.get(OWNER)
      if (owner && owner.value !== sub) {
        await db.wipe()
        queryClient.clear()
      }
      await db.meta.put({ key: OWNER, value: sub })
    } catch {
      // Storage unavailable: nothing stored can be shown, and the data layer works for the visit only.
    }
  }

  async function run(): Promise<void> {
    if (busy) return
    busy = true
    notify()
    try {
      for (;;) {
        const s = session.state()
        if (!s.resolved) break
        await reconcile(s.sub)
        reconciledSub = s.sub
        const after = session.state()
        if (!after.resolved || after.sub === s.sub) break
      }
    } finally {
      busy = false
      notify()
    }
  }

  const unsubscribe = session.subscribe(() => {
    notify()
    void run()
  })
  void run()

  const ready = () => {
    const s = session.state()
    return s.resolved && !busy && reconciledSub === s.sub
  }

  return {
    whenReady: () =>
      new Promise<void>((resolve) => {
        const check = () => {
          if (!ready()) return
          waiters.delete(check)
          resolve()
        }
        waiters.add(check)
        check()
      }),
    stop: unsubscribe,
  }
}
