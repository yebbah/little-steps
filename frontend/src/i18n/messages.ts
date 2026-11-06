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

  // Status lines (Story 2.10): confirmations after an action, announced politely.
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

  // Banners (Story 2.10): persistent notices and the stale-session prompt.
  'banner.offline': 'Saved on this device — will sync.',
  'banner.deletionPending': 'Family data will be deleted on {date}.',
  'banner.undo': 'Undo',
  'banner.dismiss': 'Dismiss notice: {firstWords}',
  'banner.region': 'Notices',
  'banner.staleSession': 'Earlier practice is still open.',
  'banner.reviewIt': 'Review it',
  'banner.closeWithoutReview': 'Close without review',

  // Empty states (Story 2.10): an invitation, never a reproach.
  'empty.firstGoal': "Let's add your first goal.",
  'empty.goals': "No goals yet. Add one from your therapist's sheet, or propose your own.",
  'empty.favourites': 'No favourites yet — tap the heart on any activity.',
  'empty.allHidden': 'Everything here is hidden. Show hidden.',
  'empty.noIdeas': 'No new ideas right now. Try a favourite?',
  'empty.summaries': 'Before an appointment, make a summary for your therapist.',
  'empty.noObservations': 'Nothing recorded in this period yet.',
  'empty.noPlan': 'Pick a few activities for this week?',
  'empty.planDone': "That's this week's plan. Anything extra is a bonus.",

  // In-progress and limited states (Story 2.10), no errors (Story 2.11 owns those).
  'state.generatingSummary': 'Drafting your summary…',
  'state.readingPage': 'Reading the page…',
  'state.needsConnection': 'Needs a connection',
  'state.aiSlow': 'Ideas are taking a moment',
  'state.ideasComing': 'More ideas are on the way',
  'state.fewObservations': 'too few to show a trend',
  'state.limitedData': 'limited data',
  'state.ready': 'Ready when you are.',
} as const satisfies Record<string, string>

export type MessageKey = keyof typeof messages

/** Looks up a catalog entry. An unknown key shows the key itself, so a gap is visible, not blank. */
export function t(key: MessageKey | (string & {})): string {
  if (key === '') return '[empty message key]'
  return Object.hasOwn(messages, key) ? (messages as Record<string, string>)[key] : key
}

/**
 * Like `t()`, and fills `{name}` placeholders from `values`. A placeholder with no value stays
 * visible, so a gap shows up in the UI instead of a blank, and nothing throws.
 */
export function tf(key: MessageKey | (string & {}), values: Record<string, string | number> = {}): string {
  return t(key).replace(/\{(\w+)\}/g, (whole, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : whole,
  )
}
