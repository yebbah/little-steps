// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { expect, test } from 'vitest'
import { PARKED_MESSAGE_KEY, RETRY_LABEL_KEY, useOutboxCommands } from './outbox.ts'
import { freshDb } from './testing.ts'
import { t } from '../i18n/messages.ts'

test("a parked command's record carries the catalog line and a Retry label", () => {
  expect(t(PARKED_MESSAGE_KEY)).toBe("Couldn't save just now. Your review is kept — try again.")
  expect(t(RETRY_LABEL_KEY)).toBe('Retry')
})

test('lists the current sub\'s commands live, and none for nobody', async () => {
  const db = freshDb()
  const base = { method: 'PUT' as const, path: '/p', body: 1, createdAt: 1, attempts: 0, status: 'pending' as const }
  await db.outbox.add({ ...base, id: 'a', targetId: 'a', sub: 'sub-x' })
  await db.outbox.add({ ...base, id: 'b', targetId: 'b', sub: 'sub-y' })
  const view = renderHook(({ sub }: { sub: string | null }) => useOutboxCommands(sub, db), { initialProps: { sub: 'sub-x' as string | null } })
  await waitFor(() => expect(view.result.current.map((c) => c.id)).toEqual(['a']))
  await db.outbox.add({ ...base, id: 'c', targetId: 'c', sub: 'sub-x', status: 'parked' })
  await waitFor(() => expect(view.result.current.map((c) => c.id)).toEqual(['a', 'c']))
  view.rerender({ sub: null })
  expect(view.result.current).toEqual([])
})
