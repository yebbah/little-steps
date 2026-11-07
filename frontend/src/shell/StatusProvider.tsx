import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigation } from 'react-router'
import { StatusContext, type StatusApi } from './statusContext.ts'
import styles from './AppShell.module.css'

/** Owns the one `role="status"` region. It sits outside the routed content and is empty from first load. */
export function StatusProvider({ children, flushSignal }: { children: ReactNode; flushSignal: string }) {
  const [text, setText] = useState('')
  const pending = useRef('')
  const frame = useRef(0)
  const navigation = useNavigation()
  const idle = useRef(true)
  useEffect(() => {
    idle.current = navigation.state === 'idle'
  }, [navigation.state])

  const flush = useCallback(() => {
    cancelAnimationFrame(frame.current)
    // Clearing first makes an identical repeat message a change that screen readers announce again.
    setText('')
    frame.current = requestAnimationFrame(() => {
      // A navigation started after announce() keeps the message waiting until the route has rendered.
      if (!idle.current || !pending.current) return
      setText(pending.current)
      pending.current = ''
    })
  }, [])

  const announce = useCallback(
    (message: string) => {
      if (!message) return
      pending.current = message
      if (idle.current) flush()
    },
    [flush],
  )

  // After a navigation has rendered, the layout has set the title and focused the h1 (it renders
  // inside this provider, so its effects run first); only then does the held message go out.
  useEffect(() => {
    if (pending.current) flush()
  }, [flushSignal, navigation.state, flush])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const api = useMemo<StatusApi>(() => ({ announce }), [announce])

  return (
    <StatusContext value={api}>
      {children}
      <div role="status" className={styles.visuallyHidden}>
        {text}
      </div>
    </StatusContext>
  )
}
