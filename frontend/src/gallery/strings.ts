// Gallery-only labels. The gallery is a developer tool, so its text lives here and not in the product
// catalog: that keeps it out of the production bundle (Story 2.1, R-01).
const strings = {
  title: 'Component gallery',
  intro: 'Design tokens, type, spacing and radii of the Playroom theme, in light and dark.',
  themeLabel: 'Colour mode',
  light: 'Light',
  dark: 'Dark',
  system: 'System',
  colours: 'Colour tokens',
  coloursHint: 'Left: light value. Right: dark twin.',
  type: 'Type scale',
  typeSample: 'Small steps, every day',
  spacing: 'Spacing and sizes',
  radii: 'Radii',
  tints: 'Domain tints',
  tintsHint: 'Each Domain shows its own label on the tint of its family.',
  icons: 'Icons',
  iconsHint: 'Object line icons in tiles of 76, 56 and 36px (the 36px tile is tinted).',
} as const

export function g(key: keyof typeof strings): string {
  return strings[key]
}

/** One line of sample text for a type token. */
export function sample(name: string): string {
  return `${name}: ${strings.typeSample}`
}

/** Sample Domain names, one per family plus an unmatched one. They are data, like a Domain a person types. */
export const sampleDomains = [
  'Social interaction',
  'Speech and language',
  'Early motor skills',
  'Play',
  'Emotional regulation',
  'Oral-motor',
  'Cooking',
] as const
