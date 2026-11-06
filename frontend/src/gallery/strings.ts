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
} as const

export function g(key: keyof typeof strings): string {
  return strings[key]
}

/** One line of sample text for a type token. */
export function sample(name: string): string {
  return `${name}: ${strings.typeSample}`
}
