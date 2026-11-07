/** How many words of a notice name its dismiss button ("Dismiss notice: Saved on this device"). */
const FIRST_WORDS = 4

/** Longest label, in characters, so text with no spaces never becomes a very long accessible name. */
const MAX_CHARS = 40

export function firstWords(text: string, count = FIRST_WORDS): string {
  const words = text.trim().split(/\s+/).slice(0, count).join(' ')
  // By code point, so a character made of two UTF-16 units is never cut in half.
  return [...words].slice(0, MAX_CHARS).join('')
}
