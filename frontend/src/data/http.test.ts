import { afterEach, expect, test, vi } from 'vitest'
import { ApiError, getJson, sendCommand, setHeaderProvider } from './http.ts'

afterEach(() => {
  vi.unstubAllGlobals()
  setHeaderProvider(() => ({}))
})

const problem = (status: number, type = 'https://littlesteps.app/problems/x') =>
  new Response(JSON.stringify({ type }), { status, headers: { 'content-type': 'application/problem+json' } })

test('getJson reads JSON and sends the identity header', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response('{"a":1}', { headers: { 'content-type': 'application/json' } }))
  vi.stubGlobal('fetch', fetchMock)
  setHeaderProvider(() => ({ 'X-Demo-Caregiver': 'c1' }))
  expect(await getJson('/api/v1/x')).toEqual({ a: 1 })
  expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'GET', headers: { 'X-Demo-Caregiver': 'c1' } })
})

test('getJson throws an ApiError with the status and the problem type', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(problem(409)))
  await expect(getJson('/api/v1/x')).rejects.toMatchObject({ status: 409, problemType: 'https://littlesteps.app/problems/x' })
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('nope', { status: 500 })))
  const error = await getJson('/api/v1/x').catch((e: unknown) => e)
  expect(error).toBeInstanceOf(ApiError)
  expect((error as ApiError).problemType).toBeUndefined()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{bad', { status: 400, headers: { 'content-type': 'application/json' } })))
  expect(await getJson('/api/v1/x').catch((e: unknown) => (e as ApiError).problemType)).toBeUndefined()
})

test('sendCommand sends the body as JSON and classifies the answer', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response('{}'))
  vi.stubGlobal('fetch', fetchMock)
  expect(await sendCommand({ method: 'PUT', path: '/api/v1/dev/echo/1', body: { a: 1 } })).toEqual({ kind: 'ok' })
  expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'PUT', body: '{"a":1}' })
  await sendCommand({ method: 'DELETE', path: '/p', body: null })
  expect(fetchMock.mock.calls[1][1].body).toBeUndefined()

  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(problem(401)))
  expect(await sendCommand({ method: 'PUT', path: '/p', body: 1 })).toEqual({ kind: 'unauthorized' })
  for (const status of [400, 409, 422]) {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(problem(status)))
    expect(await sendCommand({ method: 'PUT', path: '/p', body: 1 })).toEqual({ kind: 'rejected', problemType: 'https://littlesteps.app/problems/x' })
  }
  for (const status of [408, 429]) {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(problem(status)))
    expect(await sendCommand({ method: 'PUT', path: '/p', body: 1 })).toEqual({ kind: 'retry' })
  }
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })))
  expect(await sendCommand({ method: 'PUT', path: '/p', body: 1 })).toEqual({ kind: 'retry' })
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
  expect(await sendCommand({ method: 'PUT', path: '/p', body: 1 })).toEqual({ kind: 'retry' })
})
