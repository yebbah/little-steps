// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { useDraft } from './useDraft.ts'
import { fakeSession, freshDb } from './testing.ts'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const opts = (db = freshDb(), session = fakeSession('sub-x')) => ({ db, session, ready: () => Promise.resolve(), debounceMs: 10 })

test('draft: edited, page left, page reopened, values restored', async () => {
  const o = opts()
  const first = renderHook(() => useDraft('review', { note: '' }, o))
  await waitFor(() => expect(first.result.current.loaded).toBe(true))
  act(() => first.result.current.setValue({ note: 'half typed' }))
  expect(first.result.current.value).toEqual({ note: 'half typed' })
  await waitFor(async () => expect(await o.db.drafts.get('review')).toMatchObject({ sub: 'sub-x', value: { note: 'half typed' } }))
  first.unmount()

  const again = renderHook(() => useDraft('review', { note: '' }, o))
  await waitFor(() => expect(again.result.current.value).toEqual({ note: 'half typed' }))
  expect(again.result.current.loaded).toBe(true)
})

test('leaving the page before the debounce still saves the pending change', async () => {
  const o = { ...opts(), debounceMs: 10_000 }
  const view = renderHook(() => useDraft('k', 'a', o))
  await waitFor(() => expect(view.result.current.loaded).toBe(true))
  act(() => view.result.current.setValue('typed'))
  view.unmount()
  await waitFor(async () => expect((await o.db.drafts.get('k'))?.value).toBe('typed'))
})

test('clear removes the draft (explicit discard, or after the command is enqueued) and cancels a pending save', async () => {
  const o = opts()
  const view = renderHook(() => useDraft('k', 'start', o))
  await waitFor(() => expect(view.result.current.loaded).toBe(true))
  act(() => view.result.current.setValue('typed'))
  await act(() => view.result.current.clear())
  await wait(40)
  expect(view.result.current.value).toBe('start')
  expect(await o.db.drafts.get('k')).toBeUndefined()
  act(() => view.result.current.setValue('again'))
  await waitFor(async () => expect(await o.db.drafts.get('k')).toBeDefined())
  await act(() => view.result.current.clear())
  expect(await o.db.drafts.get('k')).toBeUndefined()
})

test('a draft typed by another sub is not restored', async () => {
  const o = opts()
  await o.db.drafts.put({ key: 'k', sub: 'sub-y', value: 'theirs', updatedAt: 1 })
  const view = renderHook(() => useDraft('k', 'mine', o))
  await waitFor(() => expect(view.result.current.loaded).toBe(true))
  expect(view.result.current.value).toBe('mine')
})

test('a sub change resets the form and loads that sub only', async () => {
  const o = opts()
  await o.db.drafts.put({ key: 'k', sub: 'sub-y', value: 'y-draft', updatedAt: 1 })
  const view = renderHook(() => useDraft('k', 'blank', o))
  await waitFor(() => expect(view.result.current.loaded).toBe(true))
  act(() => o.session.set({ resolved: true, sub: 'sub-y' }))
  await waitFor(() => expect(view.result.current.value).toBe('y-draft'))
})

test('typing before the stored draft arrives wins over the stored one', async () => {
  const o = opts()
  await o.db.drafts.put({ key: 'k', sub: 'sub-x', value: 'old', updatedAt: 1 })
  let release: () => void = () => {}
  const gate = new Promise<void>((r) => (release = r))
  const gated = { ...o, ready: () => gate }
  const view = renderHook(() => useDraft('k', 'blank', gated))
  act(() => view.result.current.setValue('new'))
  release()
  await waitFor(() => expect(view.result.current.loaded).toBe(true))
  expect(view.result.current.value).toBe('new')
})

test('storage blocked: the form works for the visit', async () => {
  const o = opts()
  const failing = () => Promise.reject(new Error('blocked'))
  o.db.drafts.get = failing as never
  o.db.drafts.put = failing as never
  o.db.drafts.delete = failing as never
  const view = renderHook(() => useDraft('k', 'start', o))
  await waitFor(() => expect(view.result.current.loaded).toBe(true))
  act(() => view.result.current.setValue('typed'))
  await wait(30)
  expect(view.result.current.value).toBe('typed')
  await act(() => view.result.current.clear())
  expect(view.result.current.value).toBe('start')
})

test('with nobody signed in nothing is stored', async () => {
  const o = opts(freshDb(), fakeSession(null))
  const view = renderHook(() => useDraft('k', 'a', o))
  await waitFor(() => expect(view.result.current.loaded).toBe(true))
  act(() => view.result.current.setValue('typed'))
  await wait(40)
  expect(view.result.current.value).toBe('typed')
  expect(await o.db.drafts.count()).toBe(0)
})

test('a pending change typed by the previous sub is not saved after a switch', async () => {
  const o = { ...opts(), debounceMs: 10_000 }
  const view = renderHook(() => useDraft('k', 'blank', o))
  await waitFor(() => expect(view.result.current.loaded).toBe(true))
  act(() => view.result.current.setValue('x-typed'))
  act(() => o.session.set({ resolved: true, sub: 'sub-y' }))
  await waitFor(() => expect(view.result.current.loaded).toBe(true))
  await wait(30)
  expect(await o.db.drafts.count()).toBe(0)
})

test('the pending change is saved when the page is hidden or closed, with no unmount', async () => {
  const o = { ...opts(), debounceMs: 10_000 }
  const view = renderHook(() => useDraft('k', 'a', o))
  await waitFor(() => expect(view.result.current.loaded).toBe(true))
  act(() => view.result.current.setValue('typed'))
  act(() => void window.dispatchEvent(new Event('pagehide')))
  await waitFor(async () => expect((await o.db.drafts.get('k'))?.value).toBe('typed'))

  await o.db.drafts.clear()
  act(() => view.result.current.setValue('typed again'))
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
  act(() => void document.dispatchEvent(new Event('visibilitychange')))
  await wait(30)
  expect(await o.db.drafts.count()).toBe(0)
  Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
  act(() => void document.dispatchEvent(new Event('visibilitychange')))
  await waitFor(async () => expect((await o.db.drafts.get('k'))?.value).toBe('typed again'))
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
})

test('the page listeners are removed on cleanup', async () => {
  const o = opts()
  const remove = vi.spyOn(window, 'removeEventListener')
  const view = renderHook(() => useDraft('k', 'a', o))
  await waitFor(() => expect(view.result.current.loaded).toBe(true))
  view.unmount()
  expect(remove).toHaveBeenCalledWith('pagehide', expect.any(Function))
  remove.mockRestore()
})
