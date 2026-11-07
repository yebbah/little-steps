import { t, tf } from '../i18n/messages.ts'
import { Button } from '../ui/Button.tsx'
import { focusMain } from './focusMain.ts'
import { firstWords } from './firstWords.ts'
import styles from './Banner.module.css'

const GLYPH_CLOSE = '×'

export interface BannerProps {
  message: string
  /** At most one action (UX-DR26). */
  action?: { label: string; onAction: () => void }
  /** Present when the notice can be dismissed. */
  onDismiss?: () => void
}

/** A persistent notice (UX-DR26): offline, deletion pending, membership changes. It never blocks the screen. */
export function Banner({ message, action, onDismiss }: BannerProps) {
  return (
    <div className={`${styles.banner} type-body-sm`}>
      <p className={styles.message}>{message}</p>
      {action || onDismiss ? (
        <div className={styles.actions}>
          {action ? (
            <Button variant="quiet" onClick={action.onAction}>
              {action.label}
            </Button>
          ) : null}
          {onDismiss ? (
            <Button variant="quiet" aria-label={tf('banner.dismiss', { firstWords: firstWords(message) })} onClick={() => {
                onDismiss()
                focusMain()
              }}
            >
              <span aria-hidden="true">{GLYPH_CLOSE}</span>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export interface NoticeItem extends BannerProps {
  id: string
}

/**
 * The "Notices" region: banners stacked newest first, in normal flow under the h1 (UX-DR26). Pass the
 * notices oldest first, as they arrived; the newest is shown on top.
 */
export function Notices({ notices }: { notices: readonly NoticeItem[] }) {
  if (notices.length === 0) return null
  return (
    <section aria-label={t('banner.region')} className={styles.region}>
      <ul className={styles.list}>
        {[...notices].reverse().map(({ id, ...banner }) => (
          <li key={id}>
            <Banner {...banner} />
          </li>
        ))}
      </ul>
    </section>
  )
}
