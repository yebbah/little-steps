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
  controls: 'Core controls',
  controlsHint:
    'Buttons, fields, chips, steppers and disclosure rows in rest, focus, selected, disabled and error states, inside fixed-width frames. Motion in these controls stops when the device asks for reduced motion.',
  frame: 'Frame',
  buttons: 'Buttons',
  primary: 'Primary',
  secondary: 'Secondary',
  quiet: 'Quiet',
  danger: 'Danger',
  disabledSuffix: 'disabled',
  focusSample: 'Focus ring',
  fields: 'Text fields',
  fieldRest: 'Note',
  fieldFilled: 'Filled note',
  fieldFilledValue: 'Waved back at the window',
  fieldError: 'Note with an error',
  fieldErrorText: 'Add a few words',
  chipsSingle: 'Where (pick one)',
  chipsMulti: 'What helped (pick any)',
  chipHome: 'At home',
  chipOutside: 'Outside',
  chipSchool: 'At school',
  chipTip: 'A tip',
  chipCue: 'A cue',
  chipPlay: 'A toy',
  steppers: 'Steppers',
  minutes: 'Minutes',
  fewerMinutes: 'Fewer minutes',
  moreMinutes: 'More minutes',
  trials: 'Trials',
  succeeded: 'Succeeded',
  tried: 'Tried',
  fewerSucceeded: 'Fewer succeeded',
  moreSucceeded: 'More succeeded',
  fewerTried: 'Fewer tried',
  moreTried: 'More tried',
  pairedError: 'Trials with an error',
  disclosures: 'Disclosure rows',
  disclosureDashed: 'If it gets hard',
  disclosureSolid: 'Model · Reading · One-to-one',
  disclosureBody: 'Try a smaller step, or come back tomorrow.',
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
