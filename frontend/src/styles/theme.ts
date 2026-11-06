// Light / Dark / System (UX-DR2). Playroom is the only theme; these are its modes.
// The choice is stored on the device and applied before first paint by the inline script in
// index.html, which must use the same storage key (a test checks it).

export type ThemeChoice = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'littlesteps.theme'

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === 'light' || value === 'dark' || value === 'system'
}

/** The stored choice, or 'system' when nothing valid is stored or storage is unavailable. */
export function readThemeChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeChoice(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

/** Applies a choice to the page without storing it. 'system' removes the override. */
export function applyTheme(choice: ThemeChoice, root: HTMLElement = document.documentElement): void {
  if (choice === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', choice)
}

/** Stores and applies a choice. A storage failure still applies the choice for this visit. */
export function setThemeChoice(choice: ThemeChoice): void {
  try {
    if (choice === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
    else localStorage.setItem(THEME_STORAGE_KEY, choice)
  } catch {
    // Private windows and blocked storage: the choice lasts for this visit only.
  }
  applyTheme(choice)
}
