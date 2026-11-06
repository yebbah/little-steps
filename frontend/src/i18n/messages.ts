/**
 * The message catalog: every user-facing sentence lives here, never inline in JSX (the server sends
 * codes and enums, not sentences). It starts empty; stories add keys as they add screens.
 * The ESLint-style rule `react/jsx-no-literals` (see .oxlintrc.json) flags literals in JSX.
 */
export const messages = {} as const satisfies Record<string, string>

export type MessageKey = keyof typeof messages

/** Looks up a catalog entry. An unknown key shows the key itself, so a gap is visible, not blank. */
export function t(key: MessageKey | (string & {})): string {
  return (messages as Record<string, string>)[key] ?? key
}
