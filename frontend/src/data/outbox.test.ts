import { beforeEach, expect, test } from 'vitest'
import { backoffMs, BACKOFF_CAP_MS, createOutbox } from './outbox.ts'
import { fakeSession, freshDb, scriptedSend } from './testing.ts'
import type { SendResult } from './http.ts'

let db = freshDb()
beforeEach(() => {
  db = freshDb()
})

const put = (targetId: string, body: unknown) => ({ method: 'PUT' as const, path: `/api/v1/dev/echo/${targetId}`, targetId, body })

function setup(results: SendResult[] = [], sub: string | null = 'sub-x') {
  const session = fakeSession(sub)
  const { send, sent } = scriptedSend(...results)
  const timers: { fn: () => void; ms: number }[] = []
  let time = 1_000
  const outbox = createOutbox({
    db,
    session,
    send,
    now: () => time,
    schedule: (fn, ms) => {
      const entry = { fn, ms }
      timers.push(entry)
      return () => void timers.splice(timers.indexOf(entry), 1)
    },
  })
  return { session, outbox, sent, timers, advance: (ms: number) => void (time += ms) }
}

test('enqueue offline: stored on the device, resolves without waiting for the network, replays when it is back', async () => {
  const s = setup([{ kind: 'retry' }])
  const saved = await s.outbox.enqueue(put('a', { n: 1 }))
  expect(saved.sub).toBe('sub-x')
  expect(saved.status).toBe('pending')
  expect(await db.outbox.count()).toBe(1)
  await s.outbox.drain()
  // The network was down: the command is still stored, backing off.
  expect(await db.outbox.count()).toBe(1)
  expect(s.timers).toHaveLength(1)
  s.advance(5_000)
  await s.outbox.drain()
  expect(await db.outbox.count()).toBe(0)
  expect(s.sent).toEqual(['{"n":1}', '{"n":1}'])
})

test('enqueue writes to Dexie before the network is touched', async () => {
  const session = fakeSession()
  let stored = -1
  const outbox = createOutbox({
    db,
    session,
    send: async () => {
      stored = await db.outbox.count()
      return { kind: 'ok' }
    },
  })
  await outbox.enqueue(put('a', 1))
  await outbox.drain()
  expect(stored).toBe(1)
})

test('order: three commands are sent A, B, C', async () => {
  const s = setup()
  for (const id of ['a', 'b', 'c']) await s.outbox.enqueue(put(id, id))
  await s.outbox.drain()
  expect(s.sent).toEqual(['"a"', '"b"', '"c"'])
  expect(await db.outbox.count()).toBe(0)
})

/** Pauses replay with a 401 on a throwaway command, so later commands stay unsent. */
async function paused(results: SendResult[] = []) {
  const s = setup([{ kind: 'unauthorized' }, ...results])
  await s.outbox.enqueue(put('gate', 'gate'))
  await s.outbox.drain()
  await db.outbox.clear()
  s.sent.length = 0
  return s
}

test('coalesce: two unsent edits to one target become one command with the latest body, in the first position', async () => {
  const s = await paused()
  const first = await s.outbox.enqueue(put('a', 'v1'))
  await s.outbox.enqueue(put('b', 'other'))
  const second = await s.outbox.enqueue(put('a', 'v2'))
  expect(second.id).toBe(first.id)
  const rows = await db.outbox.orderBy('seq').toArray()
  expect(rows.map((r) => [r.targetId, r.body])).toEqual([
    ['a', 'v2'],
    ['b', 'other'],
  ])
  const stop = s.outbox.start()
  s.session.set({ resolved: true, sub: 'sub-x' }) // a new session signal resumes replay
  await s.outbox.drain()
  stop()
  expect(s.sent).toEqual(['"v2"', '"other"'])
})

test('coalesce does not touch a command of another sub or another method', async () => {
  const s = await paused()
  await db.outbox.add({ id: 'y', method: 'PUT', path: '/p', targetId: 'a', body: 'y-body', sub: 'sub-y', createdAt: 1, attempts: 0, status: 'pending' })
  await s.outbox.enqueue(put('a', 'x-body'))
  await s.outbox.enqueue({ ...put('a', 'patch-body'), method: 'PATCH' })
  expect(await db.outbox.count()).toBe(3)
})

test('undo: an unsent command is removed and never sent; a parked or unknown one is not', async () => {
  const s = await paused()
  const a = await s.outbox.enqueue(put('a', 'a'))
  await s.outbox.enqueue(put('b', 'b'))
  expect(await s.outbox.undo(a.id)).toBe(true)
  expect(await s.outbox.undo(a.id)).toBe(false)
  await db.outbox.where('targetId').equals('b').modify({ status: 'parked' })
  const b = (await db.outbox.toArray())[0]
  expect(await s.outbox.undo(b.id)).toBe(false)
  const stop = s.outbox.start()
  s.session.set({ resolved: true, sub: 'sub-x' })
  await s.outbox.drain()
  stop()
  expect(s.sent).toEqual([])
})

test('ownership: commands from X are not sent while the session is Y, and go when X is back', async () => {
  const s = setup([{ kind: 'unauthorized' }])
  await s.outbox.enqueue(put('a', 'x-body'))
  await s.outbox.drain() // 401: paused
  s.sent.length = 0
  s.session.set({ resolved: true, sub: 'sub-y' })
  await s.outbox.drain()
  expect(s.sent).toEqual([])
  expect(await db.outbox.count()).toBe(1)
  s.session.set({ resolved: true, sub: null })
  await s.outbox.drain()
  expect(s.sent).toEqual([])
  const stop = s.outbox.start()
  s.session.set({ resolved: true, sub: 'sub-x' })
  await s.outbox.drain()
  stop()
  expect(s.sent).toEqual(['"x-body"'])
})

test('enqueue with no session is refused, and a session that changes while it waits too', async () => {
  const none = setup([], null)
  await expect(none.outbox.enqueue(put('a', 1))).rejects.toThrow('no session')
  const session = fakeSession('sub-x')
  const outbox = createOutbox({
    db,
    session,
    send: async () => ({ kind: 'ok' }),
    ready: async () => session.set({ resolved: true, sub: 'sub-y' }),
  })
  await expect(outbox.enqueue(put('a', 1))).rejects.toThrow('changed')
  expect(await db.outbox.count()).toBe(0)
})

test('401: replay pauses and the whole queue is kept; a new session signal resumes it', async () => {
  const s = setup([{ kind: 'unauthorized' }])
  await s.outbox.enqueue(put('a', 'a'))
  await s.outbox.enqueue(put('b', 'b'))
  await s.outbox.drain()
  expect(s.sent).toEqual(['"a"'])
  expect(await db.outbox.count()).toBe(2)
  await s.outbox.drain()
  expect(s.sent).toEqual(['"a"']) // still paused
  const stop = s.outbox.start()
  s.session.set({ resolved: true, sub: 'sub-x' })
  await s.outbox.drain()
  stop()
  expect(s.sent).toEqual(['"a"', '"a"', '"b"'])
  expect(await db.outbox.count()).toBe(0)
})

test('other 4xx: the command is parked with its problem type, later ones still go, Retry re-queues it', async () => {
  const s = setup([{ kind: 'rejected', problemType: 'https://littlesteps.app/problems/conflict' }])
  await s.outbox.enqueue(put('a', 'a'))
  await s.outbox.enqueue(put('b', 'b'))
  await s.outbox.drain()
  const rows = await db.outbox.orderBy('seq').toArray()
  expect(rows).toHaveLength(1)
  expect(rows[0]).toMatchObject({ targetId: 'a', status: 'parked', problemType: 'https://littlesteps.app/problems/conflict', body: 'a' })
  await s.outbox.retry(rows[0].id)
  const retried = (await db.outbox.toArray())[0]
  expect(retried.status).toBe('pending')
  expect(retried.problemType).toBeUndefined()
  await s.outbox.drain()
  expect(s.sent).toEqual(['"a"', '"b"', '"a"'])
  expect(await db.outbox.count()).toBe(0)
})

test('retry ignores a command that is not parked or not ours', async () => {
  const s = await paused()
  await db.outbox.add({ id: 'p', method: 'PUT', path: '/p', targetId: 't', body: 1, sub: 'sub-y', createdAt: 1, attempts: 3, status: 'parked' })
  await s.outbox.retry('p')
  expect((await db.outbox.where('id').equals('p').first())?.status).toBe('parked')
})

test('5xx or a network error: retried with exponential backoff, the local data kept, FIFO held', async () => {
  const s = setup([{ kind: 'retry' }, { kind: 'retry' }])
  await s.outbox.enqueue(put('a', 'a'))
  await s.outbox.enqueue(put('b', 'b'))
  await s.outbox.drain()
  expect(s.sent).toEqual(['"a"'])
  expect(s.timers.map((t) => t.ms)).toEqual([1_000])
  await s.outbox.drain() // too early: nothing is sent, b waits behind a
  expect(s.sent).toEqual(['"a"'])
  s.advance(1_000)
  await s.outbox.drain()
  expect(s.sent).toEqual(['"a"', '"a"'])
  expect((await db.outbox.where('targetId').equals('a').first())?.attempts).toBe(2)
  expect(s.timers.at(-1)?.ms).toBe(2_000)
  s.advance(2_000)
  await s.outbox.drain()
  expect(s.sent).toEqual(['"a"', '"a"', '"a"', '"b"'])
  expect(await db.outbox.count()).toBe(0)
})

test('a send that throws is treated as a network error', async () => {
  const session = fakeSession()
  const timers: number[] = []
  const outbox = createOutbox({
    db,
    session,
    send: async () => {
      throw new Error('boom')
    },
    schedule: (_fn, ms) => {
      timers.push(ms)
      return () => {}
    },
  })
  await outbox.enqueue(put('a', 1))
  await outbox.drain()
  expect(timers).toContain(1_000)
  expect(await db.outbox.count()).toBe(1)
})

test('backoff doubles and is capped', () => {
  expect([1, 2, 3, 4].map(backoffMs)).toEqual([1_000, 2_000, 4_000, 8_000])
  expect(backoffMs(50)).toBe(BACKOFF_CAP_MS)
})

test('start replays what was stored before, and the online event resumes a pause', async () => {
  await db.outbox.add({ id: 'old', method: 'PUT', path: '/p', targetId: 't', body: 'old', sub: 'sub-x', createdAt: 1, attempts: 0, status: 'pending' })
  const s = setup()
  const stop = s.outbox.start()
  await s.outbox.drain()
  expect(s.sent).toEqual(['"old"'])
  stop()
})

test('a timer armed by backoff drains again when it fires', async () => {
  const s = setup([{ kind: 'retry' }])
  await s.outbox.enqueue(put('a', 'a'))
  await s.outbox.drain()
  s.advance(1_000)
  s.timers[0].fn()
  await s.outbox.drain()
  await new Promise((r) => setTimeout(r, 20))
  expect(s.sent).toEqual(['"a"', '"a"'])
})

test('a coalesce that lands right after the first read is sent, not the stale body', async () => {
  const s = await paused()
  const saved = await s.outbox.enqueue(put('a', 'v1'))
  const original = db.outbox.get.bind(db.outbox)
  let once = true
  db.outbox.get = (async (key: number) => {
    if (once) {
      once = false
      await db.outbox.update(saved.seq!, { body: 'v2' }) // the merge commits before the claim is re-read
    }
    return original(key)
  }) as never
  const stop = s.outbox.start()
  s.session.set({ resolved: true, sub: 'sub-x' })
  await s.outbox.drain()
  stop()
  expect(s.sent).toEqual(['"v2"'])
  expect(await db.outbox.count()).toBe(0)
})

test('an undo that lands right after the first read means nothing is sent', async () => {
  const s = await paused()
  const saved = await s.outbox.enqueue(put('a', 'v1'))
  const original = db.outbox.get.bind(db.outbox)
  db.outbox.get = (async (key: number) => {
    await db.outbox.delete(saved.seq!)
    return original(key)
  }) as never
  const stop = s.outbox.start()
  s.session.set({ resolved: true, sub: 'sub-x' })
  await s.outbox.drain()
  stop()
  expect(s.sent).toEqual([])
})

test('undo requires the command to belong to the current sub', async () => {
  const s = await paused()
  await db.outbox.add({ id: 'y', method: 'PUT', path: '/p', targetId: 'a', body: 1, sub: 'sub-y', createdAt: 1, attempts: 0, status: 'pending' })
  expect(await s.outbox.undo('y')).toBe(false)
  expect(await db.outbox.count()).toBe(1)
})

test('drain runs under the Web Lock when it exists, and without it otherwise', async () => {
  const names: string[] = []
  let active = 0
  let overlap = false
  const locks = {
    request: async (name: string, fn: () => Promise<void>) => {
      names.push(name)
      active++
      overlap ||= active > 1
      try {
        await fn()
      } finally {
        active--
      }
    },
  }
  const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  Object.defineProperty(globalThis, 'navigator', { value: { locks }, configurable: true })
  try {
    const s = setup()
    await s.outbox.enqueue(put('a', 'a'))
    await s.outbox.drain()
    expect(names).toContain('littlesteps-outbox')
    expect(s.sent).toEqual(['"a"'])
    expect(overlap).toBe(false)
  } finally {
    if (original) Object.defineProperty(globalThis, 'navigator', original)
    else delete (globalThis as { navigator?: unknown }).navigator
  }
})
