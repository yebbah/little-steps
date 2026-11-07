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

/** The choice the page is showing now, read from the page itself (storage can be blocked or changed elsewhere). */
export function appliedThemeChoice(root: HTMLElement = document.documentElement): ThemeChoice {
  const applied = root.getAttribute('data-theme')
  return applied === 'light' || applied === 'dark' ? applied : 'system'
}

// The two theme-colour metas in index.html follow the device setting by media query. An explicit choice
// makes both show that choice's colour, so the browser bar matches the app; System restores them.
function syncThemeColour(choice: ThemeChoice) {
  const metas = [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')]
  const light = metas.find((m) => (m.getAttribute('media') ?? '').includes('light'))
  const dark = metas.find((m) => (m.getAttribute('media') ?? '').includes('dark'))
  if (!light || !dark) return
  light.dataset.original ??= light.content
  dark.dataset.original ??= dark.content
  const [lightColour, darkColour] = [light.dataset.original, dark.dataset.original]
  const pick = choice === 'light' ? lightColour : choice === 'dark' ? darkColour : undefined
  light.content = pick ?? lightColour
  dark.content = pick ?? darkColour
}

/** Applies a choice to the page without storing it. 'system' removes the override. */
export function applyTheme(choice: ThemeChoice, root: HTMLElement = document.documentElement): void {
  if (choice === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', choice)
  syncThemeColour(choice)
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
