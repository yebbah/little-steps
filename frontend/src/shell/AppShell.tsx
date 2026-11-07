import { useRef, type MouseEvent } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { t } from '../i18n/messages.ts'
import { InstallOffer } from '../pwa/InstallOffer.tsx'
import { StatusLineProvider } from '../surfaces/StatusLineProvider.tsx'
import { NavItems } from './NavItems.tsx'
import { StatusProvider } from './StatusProvider.tsx'
import { useRouteFocus } from './useRouteFocus.ts'
import styles from './AppShell.module.css'

/** Landmarks in reading order: skip link, nav, main. The status region is a sibling of main, never inside it. */
export function AppShell() {
  const location = useLocation()
  return (
    <StatusProvider flushSignal={location.key}>
      <StatusLineProvider flushSignal={location.key}>
        <ShellFrame />
      </StatusLineProvider>
    </StatusProvider>
  )
}

function ShellFrame() {
  const mainRef = useRef<HTMLElement>(null)
  useRouteFocus(mainRef, t)

  const skip = (event: MouseEvent) => {
    event.preventDefault()
    mainRef.current?.focus()
  }

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skip} onClick={skip}>
        {t('nav.skip')}
      </a>
      <nav aria-label={t('nav.label')} className={styles.nav}>
        <NavItems />
      </nav>
      <main id="main-content" tabIndex={-1} ref={mainRef} className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
      <InstallOffer />
      <ScrollRestoration />
    </div>
  )
}
