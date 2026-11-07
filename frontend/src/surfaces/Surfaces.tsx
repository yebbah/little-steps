import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { tintVar, type DomainFamily } from '../domain/domainTint.ts'
import styles from './Surfaces.module.css'

type DivProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'>

const join = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ')

/** A flat card: floor-lifting white, 1px edge, xl radius (UX-DR29). Never a tap target on its own. */
export function Card({ className, ...rest }: DivProps) {
  return <div {...rest} className={join(styles.card, className)} />
}

/** A smaller card for one fact or material: lg radius (UX-DR29). */
export function BlockCard({ className, ...rest }: DivProps) {
  return <div {...rest} className={join(styles.blockCard, className)} />
}

/** The Domain-tinted band at the top of a card or the Prep screen (UX-DR29). The family is chosen by the caller. */
export function HeroBand({ family, className, children, ...rest }: DivProps & { family: DomainFamily; children: ReactNode }) {
  const style: CSSProperties = { background: tintVar(family) }
  return (
    <div {...rest} className={join(styles.heroBand, className)} data-tint={family} style={style}>
      {children}
    </div>
  )
}

/** A Coach Tip block on the tip surface: no outline, lg radius (UX-DR29). */
export function TipBlock({ className, ...rest }: DivProps) {
  return <div {...rest} className={join(styles.tipBlock, 'type-body', className)} />
}
