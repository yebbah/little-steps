import { useSyncExternalStore } from 'react'

/** A small external store for `useSyncExternalStore`: the shape pwa/update.ts uses, shared. */
export interface Store<T> {
  get: () => T
  set: (next: T) => void
  subscribe: (listener: () => void) => () => void
  use: () => T
}

export function createStore<T>(initial: T): Store<T> {
  let value = initial
  const listeners = new Set<() => void>()
  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => void listeners.delete(listener)
  }
  const get = () => value
  return {
    get,
    subscribe,
    set(next) {
      if (Object.is(next, value)) return
      value = next
      listeners.forEach((l) => l())
    },
    use: () => useSyncExternalStore(subscribe, get),
  }
}
