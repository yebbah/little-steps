import { LittleStepsDb } from './db.ts'
import type { SendResult } from './http.ts'
import type { SessionPort, SessionState } from './session.ts'
import { createStore } from './store.ts'

let counter = 0
/** A fresh Dexie database per test (fake-indexeddb is in memory). */
export const freshDb = () => new LittleStepsDb(`test-${++counter}-${Math.random()}`)

export interface FakeSession extends SessionPort {
  set: (state: SessionState) => void
}

export function fakeSession(sub: string | null = 'sub-x', resolved = true): FakeSession {
  const store = createStore<SessionState>({ resolved, sub })
  return { state: store.get, subscribe: store.subscribe, set: store.set }
}

/** A `send` that answers from a script and records what was sent. */
export function scriptedSend(...results: SendResult[]) {
  const sent: string[] = []
  const queue = [...results]
  const send = async (command: { id: string; body: unknown }) => {
    sent.push(JSON.stringify(command.body))
    return queue.shift() ?? ({ kind: 'ok' } as SendResult)
  }
  return { send, sent }
}
