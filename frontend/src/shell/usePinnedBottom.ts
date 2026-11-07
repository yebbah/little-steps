import { useLayoutEffect, type RefObject } from 'react'

/** The bottom nav is pinned only on phones that are tall enough (UX-DR121): under 600px wide and 500px tall or more. */
// The complement of the CSS unpin rule (max-height: 499.98px), so no height falls between the two.
export const PINNED_BOTTOM_QUERY = '(max-width: 599.98px) and (not (max-height: 499.98px))'

/**
 * Publishes the real height of the pinned bottom nav as `--pinned-bottom-height` on the page root, so the
 * content's bottom padding and `scroll-padding-bottom` match it at any text size (UX-DR121). The value is 0
 * when the nav is not pinned (the rail from 600px, or a short viewport where the nav unpins).
 */
export function usePinnedBottom(navRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const root = document.documentElement
    // jsdom (component tests) has no matchMedia: nothing to measure there.
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia(PINNED_BOTTOM_QUERY)
    const update = () => root.style.setProperty('--pinned-bottom-height', query.matches ? `${Math.ceil(nav.getBoundingClientRect().height)}px` : '0px')
    update()
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update)
    observer?.observe(nav)
    query.addEventListener('change', update)
    return () => {
      observer?.disconnect()
      query.removeEventListener('change', update)
      root.style.removeProperty('--pinned-bottom-height')
    }
  }, [navRef])
}
