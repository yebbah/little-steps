// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

// The real wiring: the demo session, the ownership check and the outbox, started by startDataLayer().
const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } })
const command = (sub: string) => ({ id: `c-${sub}`, method: 'PUT' as const, path: '/api/v1/dev/echo/1', targetId: '1', body: { n: 1 }, sub, createdAt: 1, attempts: 0, status: 'pending' as const })

let stop = () => {}
beforeEach(() => {
  vi.resetModules()
  localStorage.clear()
})
afterEach(async () => {
  stop()
  vi.unstubAllGlobals()
  const { db } = await import('./db.ts')
  await db.wipe()
})

async function boot(fetchMock: ReturnType<typeof vi.fn>) {
  vi.stubGlobal('fetch', fetchMock)
  const { db } = await import('./db.ts')
  await db.wipe()
  const runtime = await import('./runtime.ts')
  return { db, runtime }
}

test('startDataLayer reads the session and replays a stored command of that sub', async () => {
  const fetchMock = vi.fn().mockImplementation(async (url: string) => (url === '/api/v1/session' ? json({ demo: true, sub: 'sub-x' }) : json({ n: 1 })))
  const { db, runtime } = await boot(fetchMock)
  await db.meta.put({ key: 'owner', value: 'sub-x' })
  await db.outbox.add(command('sub-x'))

  stop = runtime.startDataLayer()
  await vi.waitFor(async () => expect(await db.outbox.count()).toBe(0))

  const calls = fetchMock.mock.calls.map(([url, init]) => `${init?.method} ${url}`)
  expect(calls).toContain('GET /api/v1/session')
  expect(calls).toContain('PUT /api/v1/dev/echo/1')
  expect(runtime.session.state()).toEqual({ resolved: true, sub: 'sub-x' })
})

test('startDataLayer wipes data owned by a different sub and does not replay it', async () => {
  const fetchMock = vi.fn().mockImplementation(async (url: string) => (url === '/api/v1/session' ? json({ demo: true, sub: 'sub-x' }) : json({})))
  const { db, runtime } = await boot(fetchMock)
  await db.meta.put({ key: 'owner', value: 'sub-y' })
  await db.outbox.add(command('sub-y'))
  await db.drafts.put({ key: 'k', sub: 'sub-y', value: 'theirs', updatedAt: 1 })

  stop = runtime.startDataLayer()
  await vi.waitFor(async () => expect((await db.meta.get('owner'))?.value).toBe('sub-x'))

  expect(await db.outbox.count()).toBe(0)
  expect(await db.drafts.count()).toBe(0)
  expect(fetchMock.mock.calls.map(([, init]) => init?.method)).not.toContain('PUT')
})

test('startDataLayer is idempotent', async () => {
  const fetchMock = vi.fn().mockImplementation(async () => json({ demo: true, sub: 'sub-x' }))
  const { runtime } = await boot(fetchMock)
  stop = runtime.startDataLayer()
  runtime.startDataLayer()
  await vi.waitFor(() => expect(runtime.session.state().resolved).toBe(true))
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
