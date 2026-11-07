import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useStatus } from '../shell/statusContext.ts'
import { StatusLineContext, StatusLineValueContext, type StatusLineApi, type StatusLineValue } from './statusLineContext.ts'

/** Keys that only move focus, move through content (screen-reader navigation) or change a modifier are not an action. */
const NON_ACTION_KEYS = new Set(['Tab', 'Shift', 'Control', 'Alt', 'AltGraph', 'Meta', 'CapsLock', 'NumLock', 'ScrollLock', 'Fn', 'Dead', 'Process', 'Unidentified', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'])

/**
 * Holds the one visible status line. Announcing goes through `useStatus()`, so there is no live
 * region here. `flushSignal` changes on every navigation (the router's location key).
 */
export function StatusLineProvider({ children, flushSignal }: { children: ReactNode; flushSignal: string }) {
  const { announce } = useStatus()
  const [line, setLine] = useState<StatusLineValue | null>(null)
  // True from the moment a line is shown until the first navigation after it: that navigation is the
  // one the shown action caused, so the line survives it.
  const survive = useRef(false)

  const clear = useCallback(() => {
    survive.current = false
    setLine(null)
  }, [])

  const show = useCallback<StatusLineApi['show']>(
    (message, options) => {
      if (!message) return
      survive.current = true
      setLine({ text: message, onUndo: options?.onUndo })
      announce(message)
    },
    [announce],
  )

  // The next user action clears the line. Capture phase, so it also sees events that stop propagating.
  // The action that showed the line has already passed the document when this listener is added.
  const visible = line !== null
  useEffect(() => {
    if (!visible) return
    const onAction = (event: Event) => {
      if (event instanceof KeyboardEvent && NON_ACTION_KEYS.has(event.key)) return
      if (event.target instanceof Element && event.target.closest('[data-status-line]')) return
      clear()
    }
    document.addEventListener('click', onAction, true)
    document.addEventListener('keydown', onAction, true)
    window.addEventListener('popstate', onAction)
    return () => {
      document.removeEventListener('click', onAction, true)
      document.removeEventListener('keydown', onAction, true)
      window.removeEventListener('popstate', onAction)
    }
  }, [visible, clear])

  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (survive.current) {
      survive.current = false
      return
    }
    clear()
  }, [flushSignal, clear])

  const api = useMemo<StatusLineApi>(() => ({ show, clear }), [show, clear])

  return (
    <StatusLineContext value={api}>
      <StatusLineValueContext value={line}>{children}</StatusLineValueContext>
    </StatusLineContext>
  )
}
