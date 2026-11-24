import { QueryClient } from '@tanstack/react-query'
import { expect, test } from 'vitest'
import { startLifecycle } from './lifecycle.ts'
import { createOutbox } from './outbox.ts'
import { fakeSession, freshDb, scriptedSend } from './testing.ts'

const cmd = (sub: string) => ({ id: `c-${sub}`, method: 'PUT' as const, path: '/p', targetId: `t-${sub}`, body: 1, sub, createdAt: 1, attempts: 0, status: 'pending' as const })

test('session change: outbox, drafts and the Query cache are wiped before anything is shown or replayed', async () => {
  const db = freshDb()
  const session = fakeSession('sub-x')
  const queryClient = new QueryClient()
  queryClient.setQueryData(['goals'], ['x-data'])
  const life = startLifecycle(session, db, queryClient)
  await life.whenReady()
  await db.outbox.add(cmd('sub-x'))
  await db.drafts.put({ key: 'k', sub: 'sub-x', value: 'typed', updatedAt: 1 })

  const { send, sent } = scriptedSend()
  const outbox = createOutbox({ db, session, send, ready: life.whenReady })
  session.set({ resolved: true, sub: 'sub-y' })
  await outbox.drain()

  expect(sent).toEqual([])
  expect(await db.outbox.count()).toBe(0)
  expect(await db.drafts.count()).toBe(0)
  expect(queryClient.getQueryData(['goals'])).toBeUndefined()
  expect((await db.meta.get('owner'))?.value).toBe('sub-y')
  life.stop()
})

test('data owned by the current sub at start is kept', async () => {
  const db = freshDb()
  await db.meta.put({ key: 'owner', value: 'sub-x' })
  await db.outbox.add(cmd('sub-x'))
  const life = startLifecycle(fakeSession('sub-x'), db, new QueryClient())
  await life.whenReady()
  expect(await db.outbox.count()).toBe(1)
  life.stop()
})

test('data owned by someone else at start is wiped before whenReady resolves', async () => {
  const db = freshDb()
  await db.meta.put({ key: 'owner', value: 'sub-x' })
  await db.outbox.add(cmd('sub-x'))
  const life = startLifecycle(fakeSession('sub-y'), db, new QueryClient())
  await life.whenReady()
  expect(await db.outbox.count()).toBe(0)
  life.stop()
})

test('nothing is ready until the session has answered; no sub (401) wipes nothing', async () => {
  const db = freshDb()
  await db.meta.put({ key: 'owner', value: 'sub-x' })
  await db.outbox.add(cmd('sub-x'))
  const session = fakeSession(null, false)
  const life = startLifecycle(session, db, new QueryClient())
  let ready = false
  void life.whenReady().then(() => (ready = true))
  await new Promise((r) => setTimeout(r, 10))
  expect(ready).toBe(false)
  session.set({ resolved: true, sub: null })
  await life.whenReady()
  expect(ready).toBe(true)
  expect(await db.outbox.count()).toBe(1)
  life.stop()
})

test('a change of sub in one visit clears the Query cache even when storage is unavailable', async () => {
  const db = freshDb()
  const session = fakeSession('sub-x')
  const queryClient = new QueryClient()
  const life = startLifecycle(session, db, queryClient)
  await life.whenReady()
  db.meta.get = () => Promise.reject(new Error('blocked')) as never
  queryClient.setQueryData(['goals'], ['x-data'])
  session.set({ resolved: true, sub: 'sub-y' })
  await life.whenReady()
  expect(queryClient.getQueryData(['goals'])).toBeUndefined()
  life.stop()
})

test('a switch while reconciling is reconciled again', async () => {
  const db = freshDb()
  const session = fakeSession('sub-x')
  const life = startLifecycle(session, db, new QueryClient())
  session.set({ resolved: true, sub: 'sub-y' })
  session.set({ resolved: true, sub: 'sub-z' })
  await life.whenReady()
  expect((await db.meta.get('owner'))?.value).toBe('sub-z')
  life.stop()
})
