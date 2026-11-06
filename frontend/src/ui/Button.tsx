import type { ButtonHTMLAttributes, MouseEvent } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger'

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> & {
  variant?: ButtonVariant
  /** Disabled is `aria-disabled`, never native `disabled`: the button keeps focus and a press does nothing. */
  disabled?: boolean
}

/** Primary, secondary, quiet and danger buttons (UX-DR16, UX-DR17). The label is the caller's children. */
export function Button({ variant = 'primary', disabled = false, type = 'button', className, onClick, ...rest }: ButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      // Also stops a submit button from submitting its form.
      event.preventDefault()
      return
    }
    onClick?.(event)
  }
  return (
    <button
      {...rest}
      type={type}
      aria-disabled={disabled || undefined}
      className={[styles.button, styles[variant], 'type-label', className].filter(Boolean).join(' ')}
      onClick={handleClick}
    />
  )
}
