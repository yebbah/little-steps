import { useContext } from 'react'
import { t } from '../i18n/messages.ts'
import { Button } from '../ui/Button.tsx'
import { focusMain } from './focusMain.ts'
import { StatusLineContext, StatusLineValueContext } from './statusLineContext.ts'
import styles from './StatusLine.module.css'

const UNDO_SUFFIX = ` · ${t('banner.undo')}`

/**
 * The visible status line under a screen's `<h1>` (UX-DR25): a quiet confirmation with an optional Undo.
 * It has no live region of its own; the text is announced through the shell status region.
 * The catalog's "· Undo" suffix is dropped from the text when the Undo button is shown.
 */
export function StatusLine() {
  const line = useContext(StatusLineValueContext)
  const api = useContext(StatusLineContext)
  if (!line || !api) return null
  return (
    <StatusLineView
      text={line.text}
      onUndo={
        line.onUndo &&
        (() => {
          // Clear first: an Undo that shows its own line ("Undone") must keep it.
          api.clear()
          line.onUndo?.()
          focusMain()
        })
      }
    />
  )
}

/** The line itself, without the shell wiring: the gallery shows it directly. */
export function StatusLineView({ text, onUndo }: { text: string; onUndo?: () => void }) {
  const shown = onUndo && text.endsWith(UNDO_SUFFIX) ? text.slice(0, -UNDO_SUFFIX.length) : text
  return (
    <div className={`${styles.line} type-body-sm`} data-status-line>
      <span>{shown}</span>
      {onUndo ? (
        <Button variant="quiet" className={styles.undo} onClick={onUndo}>
          {t('banner.undo')}
        </Button>
      ) : null}
    </div>
  )
}
