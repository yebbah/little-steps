import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { db as defaultDb, type LittleStepsDb } from './db.ts'
import { session as defaultSession, whenReady as defaultReady } from './runtime.ts'
import type { SessionPort } from './session.ts'

export interface DraftOptions {
  db?: LittleStepsDb
  session?: SessionPort
  ready?: () => Promise<void>
  /** Quiet time after the last change before it is saved. */
  debounceMs?: number
}

export interface Draft<T> {
  value: T
  setValue: (next: T) => void
  /** True once a stored draft has been looked for (and restored, if there was one). */
  loaded: boolean
  /** Explicit discard, and the call to make right after the command is enqueued. */
  clear: () => Promise<void>
}

/**
 * Form state that survives leaving the page: autosaved to Dexie while it changes (debounced), restored on
 * return. If storage is blocked the value still works for the visit. Drafts belong to the `sub` that typed
 * them, and the data layer wipes them when the `sub` changes.
 */
export function useDraft<T>(key: string, initial: T, options: DraftOptions = {}): Draft<T> {
  const db = options.db ?? defaultDb
  const session = options.session ?? defaultSession
  const ready = options.ready ?? defaultReady
  const debounceMs = options.debounceMs ?? 500
  const { sub } = useSyncExternalStore(session.subscribe, session.state)

  const [value, setValueState] = useState<T>(initial)
  const [loaded, setLoaded] = useState(false)
  const initialRef = useRef(initial)
  const latest = useRef<{ value: T; dirty: boolean }>({ value: initial, dirty: false })
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const save = useCallback(
    async (owner: string | null, next: T) => {
      if (owner === null) return
      try {
        await db.drafts.put({ key, sub: owner, value: next, updatedAt: Date.now() })
      } catch {
        // Storage blocked: the value lives for this visit.
      }
    },
    [db, key],
  )

  // Restore on return, for this `sub` only.
  useEffect(() => {
    const run = { cancelled: false }
    latest.current = { value: initialRef.current, dirty: false }
    setValueState(initialRef.current)
    setLoaded(false)
    void (async () => {
      await ready()
      if (run.cancelled) return
      if (sub !== null) {
        try {
          const stored = await db.drafts.get(key)
          // Ignore a draft someone else typed, and one the Caregiver has already overtaken.
          if (!run.cancelled && stored && stored.sub === sub && !latest.current.dirty) {
            latest.current = { value: stored.value as T, dirty: false }
            setValueState(stored.value as T)
          }
        } catch {
          // Storage blocked: start empty.
        }
      }
      if (!run.cancelled) setLoaded(true)
    })()
    // Save what is pending now rather than lose it to the debounce. Only while this `sub` is still the
    // session's: after a switch the data layer wipes, and a late save would bring the previous Caregiver's
    // text back.
    const flush = () => {
      if (timer.current === undefined) return
      clearTimeout(timer.current)
      timer.current = undefined
      if (latest.current.dirty && session.state().sub === sub) void save(sub, latest.current.value)
    }
    // A hidden or closed tab may never unmount the component.
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      run.cancelled = true
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onVisibility)
      flush()
    }
  }, [db, key, sub, ready, save, session])

  const setValue = useCallback(
    (next: T) => {
      latest.current = { value: next, dirty: true }
      setValueState(next)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        timer.current = undefined
        void save(sub, next)
      }, debounceMs)
    },
    [save, sub, debounceMs],
  )

  const clear = useCallback(async () => {
    clearTimeout(timer.current)
    timer.current = undefined
    latest.current = { value: initialRef.current, dirty: false }
    setValueState(initialRef.current)
    try {
      await db.drafts.delete(key)
    } catch {
      // Storage blocked: nothing stored to remove.
    }
  }, [db, key])

  return { value, setValue, loaded, clear }
}
