import { tintVar, type DomainFamily } from '../domain/domainTint.ts'
import { Icon } from './Icon.tsx'
import type { IconName } from './names.ts'
import styles from './icons.module.css'

export type IconTileSize = 76 | 56 | 36

/** 76 (hero) and 56 (Today band) are white card tiles; 36 (plan row) is Domain-tinted when a family is given. */
export function IconTile({ name, size, tint }: { name: IconName; size: IconTileSize; tint?: DomainFamily }) {
  const tinted = size === 36 && tint !== undefined
  return (
    <span
      className={`${styles.tile} ${size === 36 ? styles.small : ''}`}
      data-size={size}
      data-tint={tinted ? tint : undefined}
      style={{ width: size, height: size, ...(tinted ? { background: tintVar(tint) } : {}) }}
    >
      <span className={styles.glyph}>
        <Icon name={name} />
      </span>
    </span>
  )
}
