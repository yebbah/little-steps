import { describe, expect, it } from 'vitest'
import { messages, tf } from './messages'

/**
 * Expected spine strings for errors, confirmations and security notices (EXPERIENCE.md, UX-DR137), one
 * table per group. Story 2.10's tables (status, banner, empty, state) live in spine-copy.test.ts.
 * A removed or reworded string fails here naming its key.
 */
const spine = {
  error: {
    'error.saveRejected':
      "Couldn't save just now. Your review is kept — try again.",
    'error.retry':
      'Retry',
    'error.offlineKept':
      "We'll keep your review on this device and sync when you're back online.",
    'error.cameraDenied':
      'Camera access is off. You can upload a photo or PDF instead, or turn the camera on in your browser settings.',
    'error.cannotReadPage':
      "We couldn't read the text on this page",
    'error.checkThis':
      'Please check this',
    'error.checkThisLeft':
      'Please check this ({count} left)',
    'error.removedFromFamily':
      "You're no longer part of this family.",
  },
  invite: {
    'invite.send':
      'Send invite',
    'invite.sent':
      'Invite sent {date}',
    'invite.resend':
      'Resend',
    'invite.cancel':
      'Cancel',
    'invite.expired':
      'This invite has expired. Ask the person who invited you to send a new one.',
  },
  consent: {
    'consent.notGiven':
      "LittleSteps needs your agreement to keep your family's information. You can read the cards again whenever you're ready.",
    'consent.pushDeclined':
      "You'll see a gentle nudge in the app instead.",
  },
  confirm: {
    'confirm.typeDelete':
      'Type DELETE to confirm',
    'confirm.deleteFamily':
      'All family data will be deleted on {date}. Any caregiver can undo this until then.',
    'confirm.removeCaregiver':
      '{caregiver} will lose access now. Everything they logged stays.',
    'confirm.leaveFamily':
      "You'll lose access to this family. Everything you logged stays.",
    'confirm.deleteOriginal':
      'The goals you confirmed stay. The file is removed.',
    'confirm.shareLeaving':
      'This will leave your family. Your summary will be shared outside LittleSteps.',
    'confirm.share':
      'Share',
    'confirm.notNow':
      'Not now',
  },
  security: {
    'security.caregiverLeft':
      '{caregiver} is no longer part of your family ({date}). See the audit log.',
    'security.caregiverJoined':
      '{caregiver} joined your family ({date}).',
    'security.deletionRequested':
      '{caregiver} asked to delete all family data. It will be deleted on {date}. You can undo this in Settings → Privacy.',
    'security.deletionCancelled':
      'Family deletion was cancelled.',
  },
} as const satisfies Record<string, Record<string, string>>

const catalog = messages as Record<string, string>

/** Keys of a group whose catalog text is missing or differs from the table, plus extra catalog keys. */
function driftIn(group: string, table: Record<string, string>, cat: Record<string, string>): string[] {
  const wrong = Object.entries(table).filter(([key, text]) => cat[key] !== text).map(([key]) => key)
  const extra = Object.keys(cat).filter((key) => key.startsWith(`${group}.`) && !(key in table))
  return [...wrong, ...extra]
}

describe.each(Object.entries(spine))('error copy: %s.*', (group, table) => {
  it.each(Object.entries(table))('%s holds the exact spine text', (key, text) => {
    expect(catalog[key], key).toBe(text)
  })

  it('lists exactly the keys of the table (no catalog key without an expected entry)', () => {
    const inCatalog = Object.keys(catalog).filter((key) => key.startsWith(`${group}.`)).sort()
    expect(inCatalog).toEqual(Object.keys(table).sort())
  })
})

describe('error copy drift detection', () => {
  it('finds no drift in the real catalog', () => {
    for (const [group, table] of Object.entries<Record<string, string>>(spine)) {
      expect(driftIn(group, table, catalog), group).toEqual([])
    }
  })

  it('names a reworded key', () => {
    const reworded = { ...catalog, 'error.saveRejected': 'Save failed.' }
    expect(driftIn('error', spine.error, reworded)).toEqual(['error.saveRejected'])
  })

  it('names a removed key', () => {
    const { 'security.deletionCancelled': _removed, ...rest } = catalog
    expect(driftIn('security', spine.security, rest)).toEqual(['security.deletionCancelled'])
  })

  it('names a catalog key that has no expected entry', () => {
    expect(driftIn('confirm', spine.confirm, { ...catalog, 'confirm.brandNew': 'New.' })).toEqual([
      'confirm.brandNew',
    ])
  })
})

describe('tf() with 2.11 strings', () => {
  it('fills every placeholder of every string in the five groups', () => {
    const values = { caregiver: 'Sam', date: '5 Nov', count: 2 }
    for (const [group, table] of Object.entries<Record<string, string>>(spine)) {
      for (const key of Object.keys(table)) {
        expect(tf(key, values), `${group}: ${key}`).not.toMatch(/\{\w+\}/)
      }
    }
  })

  it('fills security notices and confirmations exactly', () => {
    expect(tf('security.caregiverJoined', { caregiver: 'Sam', date: '5 Nov' })).toBe(
      'Sam joined your family (5 Nov).',
    )
    expect(tf('security.deletionRequested', { caregiver: 'Sam', date: '12 Nov' })).toBe(
      'Sam asked to delete all family data. It will be deleted on 12 Nov. You can undo this in Settings → Privacy.',
    )
    expect(tf('confirm.removeCaregiver', { caregiver: 'Sam' })).toBe(
      'Sam will lose access now. Everything they logged stays.',
    )
    expect(tf('confirm.deleteFamily', { date: '12 Nov' })).toBe(
      'All family data will be deleted on 12 Nov. Any caregiver can undo this until then.',
    )
    expect(tf('error.checkThisLeft', { count: 2 })).toBe('Please check this (2 left)')
    expect(tf('invite.sent', { date: '5 Nov' })).toBe('Invite sent 5 Nov')
  })

  it('keeps a missing value visible, never blank', () => {
    expect(tf('security.caregiverLeft', { caregiver: 'Sam' })).toBe(
      'Sam is no longer part of your family ({date}). See the audit log.',
    )
  })
})

describe('blame check across all five groups', () => {
  it('never blames the caregiver', () => {
    const blame = /\byou (failed|forgot|missed|didn't|should have|must)\b|your fault|\binvalid\b/i
    for (const [key, text] of Object.entries(catalog).filter(([key]) =>
      /^(error|invite|consent|confirm|security)\./.test(key),
    )) {
      expect(text, key).not.toMatch(blame)
    }
  })
})
