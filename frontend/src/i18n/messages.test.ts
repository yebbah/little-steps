import { describe, expect, it } from 'vitest'
import { messages, t } from './messages'
import { BANNED_PHRASES, findBannedPhrases } from './tone'

describe('message catalog', () => {
  it('returns the text for a known key', () => {
    expect(t('label.aiSuggested')).toBe('AI-suggested · check with your therapist if unsure.')
  })

  it('shows the key itself for an unknown key, never blank', () => {
    expect(t('no.such.key')).toBe('no.such.key')
    expect(t('toString')).toBe('toString')
    expect(t('__proto__')).toBe('__proto__')
    expect(t('')).not.toBe('')
  })

  it('holds the two standard labels exactly (UX-DR136)', () => {
    expect(messages['label.aiSuggested']).toBe('AI-suggested · check with your therapist if unsure.')
    expect(messages['label.proposedByYou']).toBe('Proposed by you · not yet discussed with the care team.')
  })

  it('uses stable group.name keys and non-empty strings', () => {
    for (const [key, text] of Object.entries(messages)) {
      expect(key).toMatch(/^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)+$/)
      expect(text.trim(), key).not.toBe('')
    }
  })
})

describe('tone check on the catalog', () => {
  it('finds no banned phrase in any catalog string', () => {
    const hits = Object.entries(messages)
      .map(([key, text]) => ({ key, found: findBannedPhrases(text) }))
      .filter(({ found }) => found.length > 0)
    expect(hits).toEqual([])
  })
})

describe('tone checker', () => {
  it.each([
    ['Missed', 'You Missed a day'],
    ['Session failed', 'Session failed.'],
    ['Insufficient data', 'insufficient data to show a trend'],
    ['No progress', 'NO PROGRESS this week'],
    ['Network error', 'Network error, try later'],
    ['Error 500', 'Error 500'],
    ['Something went wrong', 'Something   went wrong'],
    ['Great job', 'Great job, well done!'],
    ['/10', 'Score: 8/10'],
    ['/10', 'Rated /10'],
    ['x out of 10', 'You got 8 out of 10'],
    ['Great job', 'Great\u00a0job'],
  ])('flags %s', (label, text) => {
    expect(findBannedPhrases(text)).toContain(label)
  })

  it.each([
    'The notice was dismissed.',
    'Reading with Sam. 4 observations so far, too few to show a trend.',
    'Page 1/100',
    'Updated 2026/10',
    'Updated 2026/10/05',
    'Errors 5000 are not a thing',
    'A good start.',
  ])('accepts %s', (text) => {
    expect(findBannedPhrases(text)).toEqual([])
  })

  it('lists every phrase named in the spec', () => {
    expect(BANNED_PHRASES.map((p) => p.label)).toEqual([
      'Missed',
      'Session failed',
      'Insufficient data',
      'No progress',
      'Network error',
      'Error 500',
      'Something went wrong',
      'Great job',
      '/10',
      'x out of 10',
    ])
  })
})
