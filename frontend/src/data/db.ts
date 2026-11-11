import Dexie, { type Table } from 'dexie'

/** A write waiting to reach the server. Replayed in `seq` order, only under `sub`. */
export interface Command {
  /** Auto-increment: the FIFO order. Set by Dexie. */
  seq?: number
  id: string
  method: 'PUT' | 'PATCH' | 'DELETE'
  path: string
  /** The record the command changes: unsent commands for one target coalesce. */
  targetId: string
  body: unknown
  /** The session `sub` that enqueued it. */
  sub: string
  createdAt: number
  attempts: number
  status: 'pending' | 'parked'
  /** RFC 9457 problem type of the answer that parked it. */
  problemType?: string
  /** Earliest time (ms) of the next attempt, while backing off. */
  nextAttemptAt?: number
}

export interface Draft {
  key: string
  sub: string
  value: unknown
  updatedAt: number
}

/** Who owns what is stored. One row, key `owner`. */
export interface Meta {
  key: string
  value: string
}

/** Room for the offline snapshot (Epic 10): the table exists, so adding it later needs no migration. */
export interface SnapshotEntry {
  key: string
  sub: string
  value: unknown
}

export class LittleStepsDb extends Dexie {
  outbox!: Table<Command, number>
  drafts!: Table<Draft, string>
  snapshot!: Table<SnapshotEntry, string>
  meta!: Table<Meta, string>

  constructor(name = 'littlesteps') {
    super(name)
    this.version(1).stores({
      outbox: '++seq, id, targetId, [sub+status]',
      drafts: 'key',
      snapshot: 'key',
      meta: 'key',
    })
  }

  /** Removes everything the previous owner left. */
  async wipe(): Promise<void> {
    await this.transaction('rw', [this.outbox, this.drafts, this.snapshot, this.meta], async () => {
      await Promise.all([this.outbox.clear(), this.drafts.clear(), this.snapshot.clear(), this.meta.clear()])
    })
  }
}

export const db = new LittleStepsDb()
