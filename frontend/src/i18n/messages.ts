/**
 * The message catalog: every user-facing sentence lives here, never inline in JSX (the server sends
 * codes and enums, not sentences). Stories add keys as they add screens.
 * The ESLint-style rule `react/jsx-no-literals` (see .oxlintrc.json) flags literals in JSX.
 *
 * Keys are stable `group.name` strings: tests and components refer to keys, never to text.
 * Every string must pass the tone check (tone.ts, run by messages.test.ts and so by CI).
 */
export const messages = {
  // Standard labels (UX-DR136): the wording is fixed by the spec.
  'label.aiSuggested': 'AI-suggested · check with your therapist if unsure.',
  'label.proposedByYou': 'Proposed by you · not yet discussed with the care team.',
  // Stepper (Story 2.4). {n} is replaced by the caller-side number.
  'stepper.minimum': '{n}, minimum',
  'stepper.maximum': '{n}, maximum',
  'stepper.exceedsTried': "Can't be more than {n} tried",
} as const satisfies Record<string, string>

export type MessageKey = keyof typeof messages

/** Looks up a catalog entry. An unknown key shows the key itself, so a gap is visible, not blank. */
export function t(key: MessageKey | (string & {})): string {
  if (key === '') return '[empty message key]'
  return Object.hasOwn(messages, key) ? (messages as Record<string, string>)[key] : key
}
