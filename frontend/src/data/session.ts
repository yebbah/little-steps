import { ApiError, getJson, setHeaderProvider } from './http.ts'
import { createStore } from './store.ts'
import type { components } from '../api/schema'

/**
 * The session port: who is signed in, as the data layer sees it. The data layer needs only the `sub` and
 * a signal when it changes. Story 3.1 replaces the demo implementation below with the Keycloak one.
 */
export interface SessionState {
  /** False until the first answer: nothing is shown or replayed from Dexie before then. */
  resolved: boolean
  /** The current `sub`, or null (loading, or nobody signed in). */
  sub: string | null
}

export interface SessionPort {
  state: () => SessionState
  subscribe: (listener: () => void) => () => void
}

type SessionResponse = components['schemas']['SessionResponse']

const STORAGE_KEY = 'littlesteps.demoCaregiver'
const LAST_SUB_KEY = 'littlesteps.lastSub'

function readKey(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function writeKey(key: string, value: string | null): void {
  try {
    if (value) localStorage.setItem(key, value)
    else localStorage.removeItem(key)
  } catch {
    // Storage blocked: the value lasts for this visit only.
  }
}
const readChoice = () => readKey(STORAGE_KEY)
const writeChoice = (id: string | null) => writeKey(STORAGE_KEY, id)

export interface DemoSession extends SessionPort {
  /** Re-reads `GET /api/v1/session` under the chosen Caregiver. */
  refresh: () => Promise<void>
  /** Story 25.5's switcher calls this: the new `sub` is published only once the server has answered. */
  choose: (caregiverId: string | null) => Promise<void>
  /** The last `GET /api/v1/session` answer, for the label and switcher. */
  info: () => SessionResponse | null
}

/** The demo implementation: reads `GET /api/v1/session` and sends `X-Demo-Caregiver` when one is chosen. */
export function createDemoSession(read: () => Promise<SessionResponse> = () => getJson<SessionResponse>('/api/v1/session')): DemoSession {
  let chosen = readChoice()
  let info: SessionResponse | null = null
  let generation = 0
  const store = createStore<SessionState>({ resolved: false, sub: null })

  setHeaderProvider((): Record<string, string> => (chosen ? { 'X-Demo-Caregiver': chosen } : {}))

  async function refresh(): Promise<void> {
    const mine = ++generation
    let next: SessionState
    try {
      const response = await read()
      info = response
      const sub = response.demo && response.sub ? response.sub : null
      writeKey(LAST_SUB_KEY, sub)
      next = { resolved: true, sub }
    } catch (error) {
      info = null
      if (error instanceof ApiError) {
        // The server answered (401 or another HTTP error): nobody is signed in.
        writeKey(LAST_SUB_KEY, null)
        next = { resolved: true, sub: null }
      } else {
        // The network failed (offline cold start): keep the last known sub, so saving still works.
        next = { resolved: true, sub: readKey(LAST_SUB_KEY) }
      }
    }
    // A newer refresh has started: its answer wins.
    if (mine === generation) store.set(next)
  }

  return {
    state: store.get,
    subscribe: store.subscribe,
    info: () => info,
    refresh,
    async choose(caregiverId) {
      // Nothing is replayed under the old `sub` once the header changes: go to "unknown" first.
      store.set({ resolved: false, sub: null })
      chosen = caregiverId
      writeChoice(caregiverId)
      await refresh()
    },
  }
}
