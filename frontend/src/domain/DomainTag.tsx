import { domainTint, tintVar } from './domainTint.ts'
import styles from './domain.module.css'

/** A Domain's own text on its tint. The label is always shown, so colour is never the only signal. */
export function DomainTag({ domain }: { domain: string }) {
  const family = domainTint(domain)
  return (
    <span className={`${styles.tag} type-section-label`} data-tint={family} style={{ background: tintVar(family) }}>
      {domain}
    </span>
  )
}
