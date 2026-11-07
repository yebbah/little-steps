import { useId, type InputHTMLAttributes } from 'react'
import styles from './TextField.module.css'

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  /** Visible label above the field. A placeholder is never the label. */
  label: string
  /** Error text, shown under the field with a leading glyph; colour is never the only signal. */
  error?: string
  id?: string
}

/** A plain text field. No `autocomplete` or `inputmode` is set, so dictation and keyboards work as the device decides (UX-DR18). */
export function TextField({ label, error, id, className, ...rest }: TextFieldProps) {
  const generated = useId()
  const inputId = id ?? generated
  const errorId = `${inputId}-error`
  const describedBy = [rest['aria-describedby'], error ? errorId : undefined].filter(Boolean).join(' ') || undefined
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={inputId} className="type-label">
        {label}
      </label>
      <input
        type="text"
        {...rest}
        id={inputId}
        className={`${styles.input} type-body`}
        aria-invalid={error ? true : rest['aria-invalid']}
        aria-describedby={describedBy}
      />
      {error ? (
        <p id={errorId} className={`${styles.error} type-body-sm`}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
