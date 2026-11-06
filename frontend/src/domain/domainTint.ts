// DESIGN.md "Domain tints": a Domain is free text, mapped to one of seven tint families by keyword.
export type DomainFamily =
  | 'joint-attention'
  | 'communication'
  | 'motor-imitation'
  | 'play'
  | 'regulation'
  | 'sensory'
  | 'other'

/** Family order is the table order in DESIGN.md: it breaks ties between equally long keywords. */
const KEYWORDS: readonly (readonly [Exclude<DomainFamily, 'other'>, readonly string[]])[] = [
  ['joint-attention', ['joint attention', 'social interaction', 'social']],
  ['communication', ['speech', 'communication', 'language']],
  ['motor-imitation', ['imitation', 'motor', 'fine motor', 'gross motor', 'early motor']],
  ['play', ['play']],
  ['regulation', ['regulation', 'emotional']],
  ['sensory', ['sensory', 'oral-motor']],
]

export const DOMAIN_FAMILIES: readonly DomainFamily[] = [...KEYWORDS.map(([family]) => family), 'other']

const WORD_CHAR = '[\\p{L}\\p{N}]'
const matchers = KEYWORDS.flatMap(([family, words]) =>
  words.map((word) => ({
    family,
    length: word.length,
    pattern: new RegExp(`(?:^|[^\\p{L}\\p{N}])${word.replace(/[-\s]+/g, '[-\\s]+')}(?!${WORD_CHAR})`, 'iu'),
  })),
)

/** Longest whole-word keyword wins, ties go to the family higher in the table, no match is `other`. */
export function domainTint(domainName: string): DomainFamily {
  let best: { family: DomainFamily; length: number } | undefined
  for (const { family, length, pattern } of matchers) {
    if (pattern.test(domainName) && (!best || length > best.length)) best = { family, length }
  }
  return best?.family ?? 'other'
}

/** The CSS custom property that holds the family's tint (both modes, from tokens.css). */
export function tintVar(family: DomainFamily): string {
  return `var(--color-domain-${family})`
}
