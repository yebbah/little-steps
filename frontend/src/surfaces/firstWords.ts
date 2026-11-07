/** How many words of a notice name its dismiss button ("Dismiss notice: Saved on this device"). */
const FIRST_WORDS = 4

/** Longest label, in characters, so text with no spaces never becomes a very long accessible name. */
const MAX_CHARS = 40

export function firstWords(text: string, count = FIRST_WORDS): string {
  return text.trim().split(/\s+/).slice(0, count).join(' ').slice(0, MAX_CHARS)
}
