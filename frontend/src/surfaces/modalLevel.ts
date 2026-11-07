import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'

// One modal level only (UX-DR113): the first modal to open owns the slot, a second one is refused.
// The owner is a tiny external store, so a modal waiting for the slot re-renders when it is released.
let owner: symbol | null = null
const listeners = new Set<() => void>()
const setOwner = (next: symbol | null) => {
  owner = next
  listeners.forEach((listener) => listener())
}
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}
const getOwner = () => owner

/**
 * Claims the single modal slot while `open`, and makes the rest of the page inert for that time.
 * Returns the element the modal renders into and whether this modal may be shown. A modal that asks
 * to open while another is open reports itself closed through `onOpenChange(false)`, so the caller's
 * state never says "open" for a modal that is not there. A modal that asked in the same commit in
 * which the owner closed (a sheet handing off to a confirmation) gets the slot as soon as it is free.
 */
export function useModalLevel(open: boolean, onOpenChange: (open: boolean) => void) {
  const [token] = useState(() => Symbol('modal'))
  const [container] = useState(() => (typeof document === 'undefined' ? null : document.createElement('div')))
  const current = useSyncExternalStore(subscribe, getOwner, getOwner)
  const blocked = open && current !== null && current !== token
  const refuse = useRef(onOpenChange)
  useEffect(() => {
    refuse.current = onOpenChange
  })

  // The container lives in <body> for as long as the modal component is mounted, so a portal can focus into it.
  useLayoutEffect(() => {
    if (!container) return
    container.setAttribute('data-modal-root', '')
    document.body.append(container)
    return () => container.remove()
  }, [container])

  useEffect(() => {
    if (!open) return
    if (owner !== null && owner !== token) {
      refuse.current(false)
      return
    }
    setOwner(token)
    const inerted = [...document.body.children].filter((el) => el !== container && el.tagName !== 'SCRIPT' && !el.hasAttribute('inert'))
    for (const el of inerted) el.setAttribute('inert', '')
    return () => {
      for (const el of inerted) el.removeAttribute('inert')
      if (owner === token) setOwner(null)
    }
  }, [open, container, token])

  return { container, visible: open && !blocked }
}
