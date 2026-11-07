import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import styles from './ActionRow.module.css'

/** Two buttons sit side by side only while their container is at least this wide (UX-DR121). */
export const MIN_ROW_WIDTH = 400
/** ...and the text scale is at most this (130%). */
export const MAX_ROW_TEXT_SCALE = 1.3

/** iOS and iPadOS start from a 17px root (Dynamic Type); everything else from 16px. Same detection as base.css. */
function defaultRootPx(): number {
  const ios = typeof CSS !== 'undefined' && CSS.supports('font: -apple-system-body') && navigator.maxTouchPoints > 0
  return ios ? 17 : 16
}

/**
 * A row of at most two buttons, the primary last. Side by side only while the container is 400px or wider
 * and the text scale is 130% or less; otherwise they stack full width with the primary at the bottom, nearest
 * the thumb. Labels wrap, never `nowrap`.
 */
export function ActionRow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const probeRef = useRef<HTMLSpanElement>(null)
  const [row, setRow] = useState(false)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => {
      const scale = parseFloat(getComputedStyle(document.documentElement).fontSize) / defaultRootPx()
      setRow(element.getBoundingClientRect().width >= MIN_ROW_WIDTH && scale <= MAX_ROW_TEXT_SCALE + 0.001)
    }
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure)
    observer?.observe(element)
    // A 1rem-wide probe changes size when the text size changes (Dynamic Type, a browser setting), which a
    // window resize event does not report.
    if (probeRef.current) observer?.observe(probeRef.current)
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <div ref={ref} className={row ? styles.row : styles.stack} data-layout={row ? 'row' : 'stack'}>
      <span ref={probeRef} className={styles.probe} aria-hidden="true" />
      {children}
    </div>
  )
}
