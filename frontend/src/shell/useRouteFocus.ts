import { useEffect, useRef, type RefObject } from 'react'
import { useLocation, useMatches, useNavigationType } from 'react-router'
import { tf } from '../i18n/messages.ts'

export interface ScreenHandle {
  /** Catalog key of the screen name, which is also the h1 text. */
  screenKey: string
  /** Catalog key of the subject used in the document title. */
  subjectKey: string
}

// The product name is not translated, so it is a constant rather than a catalog entry.
export const PRODUCT_NAME = 'LittleSteps'

export const FOCUS_KEY_ATTRIBUTE = 'data-focus-key'

/**
 * Route change rules (UX-DR117): the title becomes "<Screen>: <subject> · LittleSteps" and focus moves to
 * the h1. On Back or Forward the element that had focus on that entry gets it back when it still exists
 * (UX-DR112). The first load sets the title but leaves focus on the skip link.
 */
export function useRouteFocus(mainRef: RefObject<HTMLElement | null>, resolve: (key: string) => string) {
  const location = useLocation()
  const navigationType = useNavigationType()
  const handle = useMatches().at(-1)?.handle as ScreenHandle | undefined
  const focusedByEntry = useRef(new Map<string, string>())
  const lastKey = useRef(location.key)
  const lastPath = useRef(location.pathname)

  const screen = handle ? resolve(handle.screenKey) : undefined
  const subject = handle ? resolve(handle.subjectKey) : undefined

  useEffect(() => {
    document.title = screen && subject ? tf('screen.titleFormat', { screen, subject, product: PRODUCT_NAME }) : PRODUCT_NAME
  }, [screen, subject, location.key])

  // Remember which element inside the routed content was focused, per history entry.
  useEffect(() => {
    const main = mainRef.current
    if (!main) return
    const remember = (event: FocusEvent) => {
      const key = (event.target as HTMLElement).getAttribute?.(FOCUS_KEY_ATTRIBUTE)
      if (key) focusedByEntry.current.set(location.key, key)
      else focusedByEntry.current.delete(location.key)
    }
    main.addEventListener('focusin', remember)
    return () => main.removeEventListener('focusin', remember)
  }, [location.key, mainRef])

  useEffect(() => {
    if (lastKey.current === location.key) return
    const redirectFromRoot = navigationType === 'REPLACE' && lastPath.current === '/'
    lastKey.current = location.key
    lastPath.current = location.pathname
    // The redirect from "/" to Today is part of the first load, not a navigation: focus stays on the skip link.
    if (redirectFromRoot) return
    const main = mainRef.current
    if (!main) return
    const remembered = navigationType === 'POP' ? focusedByEntry.current.get(location.key) : undefined
    const restored = remembered ? main.querySelector<HTMLElement>(`[${FOCUS_KEY_ATTRIBUTE}="${CSS.escape(remembered)}"]`) : null
    const target = restored ?? main.querySelector<HTMLElement>('h1')
    // Back keeps the scroll position that ScrollRestoration has just put back.
    target?.focus({ preventScroll: navigationType === 'POP' })
  }, [location.key, location.pathname, navigationType, mainRef])
}
