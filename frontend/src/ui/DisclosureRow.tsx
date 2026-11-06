import { useId, useState, type ReactNode } from 'react'
import styles from './DisclosureRow.module.css'

export interface DisclosureRowProps {
  label: string
  /** Dashed for an optional "more" row, solid for a row that holds a current value. */
  edge?: 'dashed' | 'solid'
  defaultExpanded?: boolean
  children: ReactNode
}

/** A row that expands a panel (UX-DR21): `<button aria-expanded aria-controls>` and the panel it names. */
export function DisclosureRow({ label, edge = 'dashed', defaultExpanded = false, children }: DisclosureRowProps) {
  const panelId = useId()
  const [expanded, setExpanded] = useState(defaultExpanded)
  return (
    <div>
      <button
        type="button"
        className={[styles.row, edge === 'solid' && styles.solid, 'type-label'].filter(Boolean).join(' ')}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((open) => !open)}
      >
        <span>{label}</span>
        <span className={styles.chevron} aria-hidden="true" />
      </button>
      <div id={panelId} className={styles.panel} hidden={!expanded}>
        {children}
      </div>
    </div>
  )
}
