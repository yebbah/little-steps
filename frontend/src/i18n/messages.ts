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

  // In-progress and limited states (Story 2.10), errors follow below (Story 2.11).
  'state.generatingSummary': 'Drafting your summary…',
  'state.readingPage': 'Reading the page…',
  'state.needsConnection': 'Needs a connection',
  'state.aiSlow': 'Ideas are taking a moment',
  'state.ideasComing': 'More ideas are on the way',
  'state.fewObservations': 'too few to show a trend',
  'state.limitedData': 'limited data',
  'state.ready': 'Ready when you are.',

  // Errors and honest failures (Story 2.11): calm, never blaming, the draft is always kept.
  'error.saveRejected': "Couldn't save just now. Your review is kept — try again.",
  'error.retry': 'Retry',
  'error.offlineKept': "We'll keep your review on this device and sync when you're back online.",
  'error.cameraDenied':
    'Camera access is off. You can upload a photo or PDF instead, or turn the camera on in your browser settings.',
  'error.cannotReadPage': "We couldn't read the text on this page",
  'error.checkThis': 'Please check this',
  'error.checkThisLeft': 'Please check this ({count} left)',
  'error.removedFromFamily': "You're no longer part of this family.",

  // Invites (Story 2.11).
  'invite.send': 'Send invite',
  'invite.sent': 'Invite sent {date}',
  'invite.resend': 'Resend',
  'invite.cancel': 'Cancel',
  'invite.expired': 'This invite has expired. Ask the person who invited you to send a new one.',

  // Consent and permissions (Story 2.11).
  'consent.notGiven':
    "LittleSteps needs your agreement to keep your family's information. You can read the cards again whenever you're ready.",
  'consent.pushDeclined': "You'll see a gentle nudge in the app instead.",

  // Confirmations before something leaves the family or is removed (Story 2.11).
  'confirm.typeDelete': 'Type DELETE to confirm',
  'confirm.deleteFamily': 'All family data will be deleted on {date}. Any caregiver can undo this until then.',
  'confirm.removeCaregiver': '{caregiver} will lose access now. Everything they logged stays.',
  'confirm.leaveFamily': "You'll lose access to this family. Everything you logged stays.",
  'confirm.deleteOriginal': 'The goals you confirmed stay. The file is removed.',
  'confirm.shareLeaving': 'This will leave your family. Your summary will be shared outside LittleSteps.',
  'confirm.share': 'Share',
  'confirm.notNow': 'Not now',

  // Security notices (Story 2.11): membership changes and Family deletion, shown to the other Caregivers.
  'security.caregiverLeft': '{caregiver} is no longer part of your family ({date}). See the audit log.',
  'security.caregiverJoined': '{caregiver} joined your family ({date}).',
  'security.deletionRequested':
    '{caregiver} asked to delete all family data. It will be deleted on {date}. You can undo this in Settings → Privacy.',
  'security.deletionCancelled': 'Family deletion was cancelled.',
  // App shell and navigation (Story 2.3).
  'nav.label': 'Main',
  'nav.skip': 'Skip to content',
  'nav.today': 'Today',
  'nav.goals': 'Goals',
  'nav.activities': 'Activities',
  'nav.share': 'Share',
  'nav.family': 'Family',
  'screen.titleFormat': '{screen}: {subject} · {product}',
  'screen.today.subject': "Today's steps",
  'screen.today.intro': 'Your day at a glance will appear here.',
  'screen.goals.subject': 'Your goals',
  'screen.goals.intro': 'Goals from your therapist and your own will appear here.',
  'screen.activities.subject': 'Ideas to try',
  'screen.activities.intro': 'Activities to practise will appear here.',
  'screen.share.subject': 'Summaries',
  'screen.share.intro': 'Summaries for your therapist will appear here.',
  'screen.family.subject': 'Your family',
  'screen.family.intro': 'The people in your family will appear here.',
  'screen.notFound.title': "We can't find that page",
  'screen.notFound.subject': 'Page not found',
  'screen.notFound.intro': 'The link may be old. Today is a good place to start.',
  'screen.notFound.back': 'Go to Today',

  // Surfaces and labels (Story 2.5).
  'surface.close': 'Close',
  'surface.sourceCareTeam': 'Care Team',
  'surface.sourceProposed': 'Proposed by you',
  'surface.aiSuggested': 'AI-suggested',

  // Install offer (Story 2.8): no browser is named; the path is chosen by feature detection.
  'pwa.title': 'Add LittleSteps to your home screen',
  'pwa.body': 'It opens like an app, and everything still works in your browser.',
  'pwa.instructions': 'Open your browser menu or the share button, then choose Add to Home Screen or Install.',
  'pwa.add': 'Add to home screen',
  'pwa.gotIt': 'Got it',

  // Settings (Story 2.9). Reminders and Privacy arrive with Epics 16 and 17.
  'screen.settings.title': 'Settings',
  'screen.settings.subject': 'Looks and install',
  'screen.settings.intro': 'Choose how LittleSteps looks on this device.',
  'settings.open': 'Settings',
  'settings.back': 'Back to Family',
  'settings.theme': 'Theme',
  'settings.theme.light': 'Light',
  'settings.theme.dark': 'Dark',
  'settings.theme.system': 'System',
  'settings.themeChanged': 'Theme set to {theme}.',
  'settings.addToHome': 'Add to home screen',
  'settings.alreadyInstalled': 'LittleSteps is already on your home screen.',
  'settings.installUnavailable': 'Install is not available right now. Look for Add to Home Screen in your browser menu.',
} as const satisfies Record<string, string>

export type MessageKey = keyof typeof messages

/** Looks up a catalog entry. An unknown key shows the key itself, so a gap is visible, not blank. */
export function t(key: MessageKey | (string & {})): string {
  if (key === '') return '[empty message key]'
  return Object.prototype.hasOwnProperty.call(messages, key) ? (messages as Record<string, string>)[key] : key
}

/**
 * Like `t()`, and fills `{name}` placeholders from `values`. A placeholder with no value stays
 * visible, so a gap shows up in the UI instead of a blank, and nothing throws.
 */
export function tf(key: MessageKey | (string & {}), values: Record<string, string | number> = {}): string {
  return t(key).replace(/\{(\w+)\}/g, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : whole,
  )
}
