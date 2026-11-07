import { useCallback } from 'react'
import { useStatusLine } from './statusLineContext.ts'

export interface UndoableAction {
  /** Does the one-tap action now. */
  perform: () => void
  /** Reverses it. Offered as the status line's Undo until the next action (UX-DR111). */
  undo: () => void
  /** The catalog's status text, for example `tf('status.markSaved', { mark })`. */
  message: string
}

/** One-tap actions with an Undo that lasts until the next action: perform it, then show the line with Undo. */
export function useUndo() {
  const { show } = useStatusLine()
  return useCallback(
    ({ perform, undo, message }: UndoableAction) => {
      perform()
      show(message, { onUndo: undo })
    },
    [show],
  )
}
