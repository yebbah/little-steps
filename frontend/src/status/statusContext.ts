import { createContext, useContext } from 'react'

export interface StatusApi {
  /**
   * Announces a message in the shell's single status region. The text is set on the frame after the
   * current navigation (route, title, focus on the h1) has finished, or on the next frame without one.
   * An empty message is ignored. This is the only way to announce (UX-DR116).
   */
  announce: (message: string) => void
}

export const StatusContext = createContext<StatusApi | null>(null)

export function useStatus(): StatusApi {
  const api = useContext(StatusContext)
  if (!api) throw new Error('useStatus must be used inside the app shell')
  return api
}
