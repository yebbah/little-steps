import { t } from '../i18n/messages.ts'
import styles from './Labels.module.css'

const GLYPH_INFO = 'ⓘ'

/**
 * Where a Goal or Strategy came from (UX-DR22). Always text: blue for the Care Team, honey for a
 * parent-proposed one, with its Review Status after it. The label is the caller's data (a member's
 * role) or the catalog's default.
 */
export function SourceBadge({ source, label, reviewStatus }: { source: 'careTeam' | 'parentProposed'; label?: string; reviewStatus?: string }) {
  const text = label ?? t(source === 'careTeam' ? 'surface.sourceCareTeam' : 'surface.sourceProposed')
  return (
    <span className={`${styles.badge} ${source === 'careTeam' ? styles.careTeam : styles.parentProposed} type-meta`} data-source={source}>
      {text}
      {reviewStatus ? ` · ${reviewStatus}` : null}
    </span>
  )
}

/** Marks anything an AI suggested (UX-DR23): a neutral outlined pill that always reads "AI-suggested". */
export function AiLabel() {
  return <span className={`${styles.badge} ${styles.ai} type-meta`}>{t('surface.aiSuggested')}</span>
}

/** Flags an uncertain imported field (UX-DR24): the text, an info glyph and an attention edge, never colour alone. */
export function CheckTag() {
  return (
    <span className={`${styles.check} type-meta`}>
      <span aria-hidden="true">{GLYPH_INFO}</span>
      {t('error.checkThis')}
    </span>
  )
}
