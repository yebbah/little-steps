import { describe, expect, it } from 'vitest'
import { messages, tf } from './messages'

/**
 * Expected spine strings (EXPERIENCE.md, UX-DR137), one table per group. A removed or reworded
 * string fails here naming its key. Story 2.11 adds its own tables (error, confirm, security).
 */
const spine = {
  status: {
    'status.reviewSaved': 'Review saved.',
    'status.swapped': 'Swapped for {activity} · Undo',
    'status.notAttempted': "That's okay — logged as not today · Undo",
    'status.periodStarted': 'New period started.',
    'status.feedbackSaved': 'Feedback saved. New Restrictions apply from the next Plan.',
    'status.markSaved': 'Mark saved: {mark} · Undo',
    'status.alreadyMarked': 'Already marked',
    'status.ideaAdded': '1 more idea added',
    'status.itemsCovered': '{count} items covered',
    'status.uncovered': 'Uncovered: {line} · Undo',
    'status.reviewedBy': 'Reviewed by {caregiver}',
  },
  banner: {
    'banner.offline': 'Saved on this device — will sync.',
    'banner.deletionPending': 'Family data will be deleted on {date}.',
    'banner.undo': 'Undo',
    'banner.dismiss': 'Dismiss notice: {firstWords}',
    'banner.region': 'Notices',
    'banner.staleSession': 'Earlier practice is still open.',
    'banner.reviewIt': 'Review it',
    'banner.closeWithoutReview': 'Close without review',
  },
  empty: {
    'empty.firstGoal': "Let's add your first goal.",
    'empty.goals': "No goals yet. Add one from your therapist's sheet, or propose your own.",
    'empty.favourites': 'No favourites yet — tap the heart on any activity.',
    'empty.allHidden': 'Everything here is hidden. Show hidden.',
    'empty.noIdeas': 'No new ideas right now. Try a favourite?',
    'empty.summaries': 'Before an appointment, make a summary for your therapist.',
    'empty.noObservations': 'Nothing recorded in this period yet.',
    'empty.noPlan': 'Pick a few activities for this week?',
    'empty.planDone': "That's this week's plan. Anything extra is a bonus.",
  },
  state: {
    'state.generatingSummary': 'Drafting your summary…',
    'state.readingPage': 'Reading the page…',
    'state.needsConnection': 'Needs a connection',
    'state.aiSlow': 'Ideas are taking a moment',
    'state.ideasComing': 'More ideas are on the way',
    'state.fewObservations': 'too few to show a trend',
    'state.limitedData': 'limited data',
    'state.ready': 'Ready when you are.',
  },
} as const

const catalog = messages as Record<string, string>

/** Keys of a group whose catalog text is missing or differs from the table, plus extra catalog keys. */
function driftIn(group: string, table: Record<string, string>, cat: Record<string, string>): string[] {
  const wrong = Object.entries(table).filter(([key, text]) => cat[key] !== text).map(([key]) => key)
  const extra = Object.keys(cat).filter((key) => key.startsWith(`${group}.`) && !(key in table))
  return [...wrong, ...extra]
}

describe.each(Object.entries(spine))('spine copy: %s.*', (group, table) => {
  it.each(Object.entries(table))('%s holds the exact spine text', (key, text) => {
    expect(catalog[key], key).toBe(text)
  })

  it('lists exactly the keys of the table (no catalog key without an expected entry)', () => {
    const inCatalog = Object.keys(catalog).filter((key) => key.startsWith(`${group}.`)).sort()
    expect(inCatalog).toEqual(Object.keys(table).sort())
  })
})

describe('spine drift detection', () => {
  const table = spine.status

  it('finds no drift in the real catalog', () => {
    for (const [group, groupTable] of Object.entries(spine)) {
      expect(driftIn(group, groupTable, catalog)).toEqual([])
    }
  })

  it('names a removed key', () => {
    const { 'status.reviewSaved': _removed, ...rest } = catalog
    expect(driftIn('status', table, rest)).toEqual(['status.reviewSaved'])
  })

  it('names a reworded key', () => {
    expect(driftIn('status', table, { ...catalog, 'status.reviewSaved': 'Review stored.' })).toEqual([
      'status.reviewSaved',
    ])
  })

  it('names a catalog key that has no expected entry', () => {
    expect(driftIn('status', table, { ...catalog, 'status.brandNew': 'New.' })).toEqual(['status.brandNew'])
  })

  it('spells every placeholder as a plain word, so tf() can fill it', () => {
    for (const [key, text] of Object.entries(catalog)) {
      const braces = text.match(/\{[^}]*\}/g) ?? []
      for (const brace of braces) expect(brace, key).toMatch(/^\{\w+\}$/)
    }
  })
})

describe('tf() placeholder fill', () => {
  it('fills a placeholder', () => {
    expect(tf('status.swapped', { activity: 'Bubble play' })).toBe('Swapped for Bubble play · Undo')
  })

  it('fills several placeholders and numbers', () => {
    expect(tf('status.itemsCovered', { count: 3 })).toBe('3 items covered')
    expect(tf('status.markSaved', { mark: 'Tried' })).toBe('Mark saved: Tried · Undo')
  })

  it('keeps a missing placeholder visible, never blank, never throws', () => {
    expect(tf('status.swapped', {})).toBe('Swapped for {activity} · Undo')
    expect(tf('status.swapped')).toBe('Swapped for {activity} · Undo')
    expect(tf('status.swapped', { other: 'x' })).toBe('Swapped for {activity} · Undo')
  })

  it('returns the key itself for an unknown key, as t()', () => {
    expect(tf('no.such', { activity: 'x' })).toBe('no.such')
  })

  it('returns a string without placeholders unchanged', () => {
    expect(tf('status.reviewSaved', { activity: 'x' })).toBe('Review saved.')
  })

  it('does not interpret $ patterns or inherited names in values', () => {
    expect(tf('status.swapped', { activity: '$&$1' })).toBe('Swapped for $&$1 · Undo')
    expect(tf('status.reviewedBy', {})).toBe('Reviewed by {caregiver}')
    expect(tf('status.reviewedBy', Object.create({ caregiver: 'Sam' }))).toBe('Reviewed by {caregiver}')
  })
})
