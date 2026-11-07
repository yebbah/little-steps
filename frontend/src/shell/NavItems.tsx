import { NavLink } from 'react-router'
import { Icon } from '../icons/Icon.tsx'
import { NAV_ICON_NAMES } from '../icons/names.ts'
import { t, type MessageKey } from '../i18n/messages.ts'
import styles from './AppShell.module.css'

export function NavItems() {
  return (
    <ul className={styles.navList}>
      {NAV_ICON_NAMES.map((name) => (
        <li key={name} className={styles.navItem}>
          <NavLink to={`/${name}`} className={styles.navLink}>
            <span className={styles.navIcon}>
              <Icon name={name} />
            </span>
            <span className={styles.navLabel}>{t(`nav.${name}` as MessageKey)}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
