import { createContext, useContext } from 'react'

export interface StatusLineValue {
  text: string
  /** Present when the line offers a quiet Undo. */
  onUndo?: () => void
}

export interface StatusLineApi {
  /**
   * Shows the line under the screen's h1 and announces it through the shell status region (UX-DR25). It
   * survives the navigation its own action causes and clears on the next click, key press or back
   * navigation, never on a timer. Empty text is ignored.
   */
  show: (message: string, options?: { onUndo?: () => void }) => void
  clear: () => void
}

export const StatusLineContext = createContext<StatusLineApi | null>(null)
export const StatusLineValueContext = createContext<StatusLineValue | null>(null)

export function useStatusLine(): StatusLineApi {
  const api = useContext(StatusLineContext)
  if (!api) throw new Error('useStatusLine must be used inside the app shell')
  return api
}
