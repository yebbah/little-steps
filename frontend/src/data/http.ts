// The only module in src/ that calls the global `fetch` (oxlint bans it everywhere else, AD-5). Reads (GET)
// feed TanStack Query; writes (PUT, PATCH, DELETE) are made only for the outbox.
import type { Command } from './db.ts'

/** A failed read: carries the status and the RFC 9457 problem type when the server sent one. */
export class ApiError extends Error {
  readonly status: number
  readonly problemType?: string
  constructor(status: number, problemType?: string) {
    super(`HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.problemType = problemType
  }
}

type HeaderProvider = () => Record<string, string>
let headerProvider: HeaderProvider = () => ({})

/** The session registers here, so every request carries its identity header (the demo's `X-Demo-Caregiver`). */
export function setHeaderProvider(provider: HeaderProvider): void {
  headerProvider = provider
}

async function problemTypeOf(response: Response): Promise<string | undefined> {
  try {
    if (!response.headers.get('content-type')?.includes('json')) return undefined
    const body: unknown = await response.json()
    const type = (body as { type?: unknown } | null)?.type
    return typeof type === 'string' ? type : undefined
  } catch {
    return undefined
  }
}

/** The query function for TanStack Query. */
export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { method: 'GET', headers: { Accept: 'application/json', ...headerProvider() }, signal })
  if (!response.ok) throw new ApiError(response.status, await problemTypeOf(response))
  return (await response.json()) as T
}

/** What one replay attempt came to. */
export type SendResult =
  | { kind: 'ok' }
  | { kind: 'unauthorized' }
  | { kind: 'rejected'; problemType?: string }
  | { kind: 'retry' }

/** Sends one outbox command. Never throws: a network error and a 5xx are `retry`. */
export async function sendCommand(command: Pick<Command, 'method' | 'path' | 'body'>): Promise<SendResult> {
  let response: Response
  try {
    response = await fetch(command.path, {
      method: command.method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headerProvider() },
      body: command.method === 'DELETE' ? undefined : JSON.stringify(command.body),
    })
  } catch {
    return { kind: 'retry' }
  }
  if (response.ok) return { kind: 'ok' }
  if (response.status === 401) return { kind: 'unauthorized' }
  // 408 and 429 say "try again later": retried with backoff, not parked.
  if (response.status === 408 || response.status === 429) return { kind: 'retry' }
  if (response.status >= 400 && response.status < 500) return { kind: 'rejected', problemType: await problemTypeOf(response) }
  return { kind: 'retry' }
}
