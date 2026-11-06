/**
 * Tone check (UX-DR135, UX-DR136): phrases that must never appear in a catalog string.
 * Each entry is matched case-insensitively. Word phrases match whole words only, so "dismissed"
 * is not "Missed"; the score patterns match "8/10", "/10" and "8 out of 10" but not "1/100" or a date such as 2026/10.
 */
export const BANNED_PHRASES: readonly { label: string; pattern: RegExp }[] = [
  ...[
    'Missed',
    'Session failed',
    'Insufficient data',
    'No progress',
    'Network error',
    'Error 500',
    'Something went wrong',
    'Great job',
  ].map((phrase) => ({
    label: phrase,
    pattern: new RegExp(`(?<![\\p{L}\\p{N}])${phrase.replace(/ /g, '\\s+')}(?![\\p{L}\\p{N}])`, 'iu'),
  })),
  { label: '/10', pattern: /(?<![\d/])(?:\d{1,2}\s?)?\/\s?10(?![\d/])/ },
  { label: 'x out of 10', pattern: /(?<!\d)\d{1,2}\s+(?:out\s+of|of)\s+10(?!\d)/i },
]

/** Returns the labels of every banned phrase found in `text` (empty when the text is fine). */
export function findBannedPhrases(text: string): string[] {
  const normalised = text.normalize('NFKC').replace(/[‘’]/g, "'")
  return BANNED_PHRASES.filter(({ pattern }) => pattern.test(normalised)).map(({ label }) => label)
}
