import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import { db as defaultDb, type Command, type LittleStepsDb } from './db.ts'
import { sendCommand, type SendResult } from './http.ts'
import type { SessionPort } from './session.ts'

/** Catalog keys for a parked command's record (Story 2.11 copy, reused). */
export const PARKED_MESSAGE_KEY = 'error.saveRejected'
export const RETRY_LABEL_KEY = 'error.retry'

export const BACKOFF_BASE_MS = 1_000
export const BACKOFF_CAP_MS = 60_000

export type NewCommand = Pick<Command, 'method' | 'path' | 'targetId' | 'body'>

export interface OutboxDeps {
  db: LittleStepsDb
  session: SessionPort
  send?: (command: Command) => Promise<SendResult>
  /** Resolves when stored data is safe to use (see lifecycle.ts). */
  ready?: () => Promise<void>
  now?: () => number
  /** Calls `fn` after `ms`; returns a canceller. */
  schedule?: (fn: () => void, ms: number) => () => void
  newId?: () => string
}

export interface Outbox {
  /** Stores the command on the device and returns at once; replay runs in the background. */
  enqueue: (command: NewCommand) => Promise<Command>
  /** Removes an unsent command. False when it was already sent, parked or gone. */
  undo: (id: string) => Promise<boolean>
  /** Moves a parked command back to pending. */
  retry: (id: string) => Promise<void>
  /** Runs replay until the queue is empty, paused, waiting for backoff or not ours. */
  drain: () => Promise<void>
  /** Replays on session changes and when the browser comes back online. Returns a stopper. */
  start: () => () => void
}

export function backoffMs(attempts: number): number {
  return Math.min(BACKOFF_CAP_MS, BACKOFF_BASE_MS * 2 ** Math.max(0, attempts - 1))
}

export function createOutbox(deps: OutboxDeps): Outbox {
  const { db, session } = deps
  const send = deps.send ?? ((c: Command) => sendCommand(c))
  const ready = deps.ready ?? (() => Promise.resolve())
  const now = deps.now ?? Date.now
  const schedule =
    deps.schedule ??
    ((fn, ms) => {
      const handle = setTimeout(fn, ms)
      return () => clearTimeout(handle)
    })
  const newId = deps.newId ?? (() => crypto.randomUUID())

  let inFlight: string | null = null
  let paused = false
  let running: Promise<void> | null = null
  let again = false
  let cancelTimer: (() => void) | null = null

  function arm(ms: number) {
    cancelTimer?.()
    cancelTimer = schedule(() => {
      cancelTimer = null
      void drain()
    }, ms)
  }

  async function next(sub: string): Promise<Command | undefined> {
    const pending = await db.outbox.where('[sub+status]').equals([sub, 'pending']).sortBy('seq')
    return pending[0]
  }

  async function pass(): Promise<boolean> {
    await ready()
    const sub = session.state().sub
    if (sub === null || paused) return false
    let command = await next(sub)
    if (!command) return false
    const wait = (command.nextAttemptAt ?? 0) - now()
    // FIFO: a command backing off holds the ones behind it.
    if (wait > 0) {
      arm(wait)
      return false
    }
    // Claim it first, so a coalesce or undo that commits from now on leaves it alone; then read the row
    // again, because one may have committed between the read above and the claim.
    inFlight = command.id
    const current = command.seq === undefined ? undefined : await db.outbox.get(command.seq)
    if (!current || current.status !== 'pending') {
      inFlight = null
      return true
    }
    // Checked after the last await, so a switch of Caregiver cannot slip between the check and the send.
    if (session.state().sub !== sub) {
      inFlight = null
      return false
    }
    command = current
    let result: SendResult
    try {
      result = await send(command)
    } catch {
      result = { kind: 'retry' }
    } finally {
      inFlight = null
    }
    switch (result.kind) {
      case 'ok':
        await db.outbox.where('id').equals(command.id).delete()
        return true
      case 'unauthorized':
        // Keep the whole queue; Story 3.2 signs in again in place. A new session signal resumes replay.
        paused = true
        return false
      case 'rejected':
        await db.outbox.where('id').equals(command.id).modify({ status: 'parked', problemType: result.problemType })
        return true
      case 'retry': {
        const attempts = command.attempts + 1
        await db.outbox.where('id').equals(command.id).modify({ attempts, nextAttemptAt: now() + backoffMs(attempts) })
        arm(backoffMs(attempts))
        return false
      }
    }
  }

  function drain(): Promise<void> {
    if (running) {
      again = true
      return running
    }
    const work = async () => {
      do {
        again = false
        while (await pass()) {
          // keep going while commands are accepted or parked
        }
      } while (again)
    }
    running = (async () => {
      try {
        // One drain at a time across tabs: they share this Dexie queue.
        const locks = globalThis.navigator?.locks
        if (locks) await locks.request('littlesteps-outbox', work)
        else await work()
      } finally {
        running = null
      }
    })()
    return running
  }

  return {
    async enqueue(input) {
      const sub = session.state().sub
      if (sub === null) throw new Error('Cannot save: no session')
      await ready()
      if (session.state().sub !== sub) throw new Error('Cannot save: the session changed')
      const saved = await db.transaction('rw', db.outbox, async () => {
        const unsent = await db.outbox.where('targetId').equals(input.targetId).toArray()
        const earlier = unsent
          .filter((c) => c.sub === sub && c.status === 'pending' && c.method === input.method && c.id !== inFlight)
          .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))[0]
        if (earlier) {
          // Coalesce: the latest body, the first position.
          const merged: Command = { ...earlier, body: input.body, path: input.path, attempts: 0, nextAttemptAt: undefined }
          await db.outbox.put(merged)
          return merged
        }
        const command: Command = { ...input, id: newId(), sub, createdAt: now(), attempts: 0, status: 'pending' }
        const seq = await db.outbox.add(command)
        return { ...command, seq }
      })
      void drain()
      return saved
    },

    async undo(id) {
      return db.transaction('rw', db.outbox, async () => {
        const command = await db.outbox.where('id').equals(id).first()
        const sub = session.state().sub
        if (!command || command.sub !== sub || command.status !== 'pending' || command.id === inFlight) return false
        await db.outbox.delete(command.seq!)
        return true
      })
    },

    async retry(id) {
      const sub = session.state().sub
      await db.outbox
        .where('id')
        .equals(id)
        .filter((c) => c.sub === sub && c.status === 'parked')
        .modify((c) => {
          c.status = 'pending'
          c.attempts = 0
          delete c.problemType
          delete c.nextAttemptAt
        })
      void drain()
    },

    drain,

    start() {
      const resume = () => {
        paused = false
        void drain()
      }
      const unsubscribe = session.subscribe(resume)
      const online = () => resume()
      globalThis.addEventListener?.('online', online)
      void drain()
      return () => {
        unsubscribe()
        globalThis.removeEventListener?.('online', online)
        cancelTimer?.()
        cancelTimer = null
      }
    },
  }
}

/** The commands the current `sub` has waiting, live: a screen shows `PARKED_MESSAGE_KEY` and a Retry on parked ones. */
export function useOutboxCommands(sub: string | null, database: LittleStepsDb = defaultDb): Command[] {
  const [commands, setCommands] = useState<Command[]>([])
  useEffect(() => {
    if (sub === null) return
    const subscription = liveQuery(() => database.outbox.orderBy('seq').filter((c) => c.sub === sub).toArray()).subscribe({
      next: setCommands,
      error: () => setCommands([]),
    })
    return () => subscription.unsubscribe()
  }, [sub, database])
  return sub === null ? [] : commands
}
