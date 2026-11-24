// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createQueryClient } from './queryClient.ts'
import { ApiError, getJson, setHeaderProvider } from './http.ts'
import { createDemoSession } from './session.ts'
import { createOutbox } from './outbox.ts'
import { freshDb } from './testing.ts'
import { createStore } from './store.ts'

const answer = (sub: string, demo = true) => ({ sub, demo, caregiverId: `id-${sub}` })

beforeEach(() => localStorage.clear())
afterEach(() => {
  vi.unstubAllGlobals()
  setHeaderProvider(() => ({}))
})

test('the demo session publishes the sub from GET /api/v1/session', async () => {
  const session = createDemoSession(async () => answer('demo-anna'))
  expect(session.state()).toEqual({ resolved: false, sub: null })
  await session.refresh()
  expect(session.state()).toEqual({ resolved: true, sub: 'demo-anna' })
  expect(session.info()?.caregiverId).toBe('id-demo-anna')
})

test('no sub when the session answers 401 or demo is false', async () => {
  const off = createDemoSession(async () => answer('demo-anna', false))
  await off.refresh()
  expect(off.state()).toEqual({ resolved: true, sub: null })
  const denied = createDemoSession(async () => {
    throw new ApiError(401)
  })
  await denied.refresh()
  expect(denied.state()).toEqual({ resolved: true, sub: null })
  expect(denied.info()).toBeNull()
})

test('choose sends X-Demo-Caregiver on every request and goes through "unknown" before the new sub', async () => {
  const fetchMock = vi.fn().mockImplementation(async () => new Response('{"demo":true,"sub":"demo-ben"}', { headers: { 'content-type': 'application/json' } }))
  vi.stubGlobal('fetch', fetchMock)
  const session = createDemoSession(() => getJson('/api/v1/session'))
  const seen: (string | null)[] = []
  session.subscribe(() => seen.push(session.state().sub))
  await session.choose('id-ben')
  expect(seen).toEqual([null, 'demo-ben'])
  expect(fetchMock.mock.calls[0][1].headers).toMatchObject({ 'X-Demo-Caregiver': 'id-ben' })
  expect(localStorage.getItem('littlesteps.demoCaregiver')).toBe('id-ben')
  // A new session reads the remembered choice.
  createDemoSession(() => getJson('/api/v1/session'))
  await getJson('/api/v1/x')
  expect(fetchMock.mock.calls[1][1].headers).toMatchObject({ 'X-Demo-Caregiver': 'id-ben' })
  await session.choose(null)
  expect(localStorage.getItem('littlesteps.demoCaregiver')).toBeNull()
})

test('the newest refresh wins over a slower older one', async () => {
  const resolvers: ((v: ReturnType<typeof answer>) => void)[] = []
  const session = createDemoSession(() => new Promise((resolve) => resolvers.push(resolve)))
  const first = session.refresh()
  const second = session.refresh()
  resolvers[1](answer('new'))
  await second
  resolvers[0](answer('old'))
  await first
  expect(session.state().sub).toBe('new')
})

test('blocked storage does not break the choice', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  const session = createDemoSession(async () => answer('demo-anna'))
  await session.choose('id-anna')
  expect(session.state().sub).toBe('demo-anna')
  vi.restoreAllMocks()
})

test('the Query client does not retry a 4xx but retries a 5xx twice', () => {
  const retry = createQueryClient().getDefaultOptions().queries!.retry as (n: number, e: Error) => boolean
  expect(retry(0, new ApiError(404))).toBe(false)
  expect(retry(0, new ApiError(503))).toBe(true)
  expect(retry(2, new ApiError(503))).toBe(false)
  expect(retry(0, new TypeError('offline'))).toBe(true)
})

test('the store notifies on change only', () => {
  const store = createStore(1)
  const listener = vi.fn()
  const off = store.subscribe(listener)
  store.set(1)
  store.set(2)
  off()
  store.set(3)
  expect(listener).toHaveBeenCalledTimes(1)
  expect(store.get()).toBe(3)
})

test('offline cold start: a network failure keeps the last known sub, and saving still works', async () => {
  const online = createDemoSession(async () => answer('demo-anna'))
  await online.refresh()
  const offline = createDemoSession(async () => {
    throw new TypeError('Failed to fetch')
  })
  await offline.refresh()
  expect(offline.state()).toEqual({ resolved: true, sub: 'demo-anna' })
  const db = freshDb()
  const outbox = createOutbox({ db, session: offline, send: async () => ({ kind: 'retry' }), schedule: () => () => {} })
  const saved = await outbox.enqueue({ method: 'PUT', path: '/api/v1/dev/echo/a', targetId: 'a', body: 1 })
  expect(saved.sub).toBe('demo-anna')
})

test('a network failure with no stored sub is signed out', async () => {
  const session = createDemoSession(async () => {
    throw new TypeError('Failed to fetch')
  })
  await session.refresh()
  expect(session.state()).toEqual({ resolved: true, sub: null })
})

test('a 401 gives null and forgets the stored sub', async () => {
  await createDemoSession(async () => answer('demo-anna')).refresh()
  const denied = createDemoSession(async () => {
    throw new ApiError(401)
  })
  await denied.refresh()
  expect(denied.state()).toEqual({ resolved: true, sub: null })
  const offline = createDemoSession(async () => {
    throw new TypeError('Failed to fetch')
  })
  await offline.refresh()
  expect(offline.state().sub).toBeNull()
})
