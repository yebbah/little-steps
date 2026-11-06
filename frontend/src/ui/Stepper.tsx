import { useEffect, useId, useState } from 'react'
import { t } from '../i18n/messages.ts'
import styles from './Stepper.module.css'

export interface StepperProps {
  /** Visible label for the number field. */
  label: string
  value: number | undefined
  onChange: (value: number | undefined) => void
  /** Accessible names for the buttons, from the catalog ("Fewer minutes", "More minutes"). */
  decrementLabel: string
  incrementLabel: string
  min?: number
  /** A ceiling that is not committed above: an over-limit entry shows `maxMessage` and `onChange` is not called. */
  max?: number
  maxMessage?: string
}

const fill = (key: 'stepper.minimum' | 'stepper.maximum', n: number) => t(key).replace('{n}', String(n))

/** Turns what was typed into a value: empty stays empty, anything negative clamps to the minimum, non-digits drop. */
function parseEntry(raw: string, min: number): number | undefined {
  if (raw.trim().startsWith('-')) return min
  const whole = Number(raw)
  if (raw.trim() !== '' && Number.isFinite(whole)) return Math.max(min, Math.trunc(whole))
  const digits = raw.replace(/\D/g, '')
  return digits === '' ? undefined : Math.max(min, Number(digits))
}

/**
 * One stepper: "−", a native number input, "+" (UX-DR20). Values clamp at `min`; at the limit the button is
 * `aria-disabled` and keeps focus. Value changes show in the input; there is no live region.
 */
export function Stepper({ label, value, onChange, decrementLabel, incrementLabel, min = 0, max, maxMessage }: StepperProps) {
  const inputId = useId()
  const errorId = `${inputId}-error`
  // An entry above `max` is held here and not committed to the caller.
  const [draft, setDraft] = useState<number | null>(null)
  const shown = draft ?? value
  const over = shown !== undefined && max !== undefined && shown > max

  const apply = (next: number | undefined) => {
    if (next !== undefined && max !== undefined && next > max) {
      setDraft(next)
      return
    }
    setDraft(null)
    onChange(next)
  }

  // The ceiling rose (for example Tried went up): a held entry that is now valid is committed.
  useEffect(() => {
    if (draft !== null && (max === undefined || draft <= max)) {
      // The caller owns `max`, so the held entry can only be released after the caller's render.
      // oxlint-disable-next-line react/set-state-in-effect
      setDraft(null)
      onChange(draft)
    }
  }, [draft, max, onChange])

  const atMin = shown === undefined || shown <= min
  const atMax = shown !== undefined && max !== undefined && shown >= max
  let valueText: string | undefined
  if (shown !== undefined && shown <= min) valueText = fill('stepper.minimum', shown)
  else if (shown !== undefined && atMax && !over) valueText = fill('stepper.maximum', shown)

  const press = (disabled: boolean, next: number) => () => {
    if (!disabled) apply(next)
  }

  return (
    <div className={styles.stepper}>
      <label htmlFor={inputId} className="type-label">
        {label}
      </label>
      <div className={styles.control}>
        <button
          type="button"
          className={`${styles.button} ${styles.minus}`}
          aria-label={decrementLabel}
          aria-disabled={atMin || undefined}
          onClick={press(atMin, (shown ?? min) - 1)}
        />
        <input
          id={inputId}
          className={`${styles.input} type-body`}
          type="number"
          inputMode="numeric"
          min={min}
          value={shown ?? ''}
          aria-valuetext={valueText}
          aria-invalid={over || undefined}
          aria-describedby={over && maxMessage ? errorId : undefined}
          onChange={(event) => apply(parseEntry(event.target.value, min))}
        />
        <button
          type="button"
          className={`${styles.button} ${styles.plus}`}
          aria-label={incrementLabel}
          aria-disabled={atMax || undefined}
          onClick={press(atMax, shown === undefined ? Math.max(min, 1) : shown + 1)}
        />
      </div>
      {over && maxMessage ? (
        <p id={errorId} className={`${styles.error} type-body-sm`}>
          {maxMessage}
        </p>
      ) : null}
    </div>
  )
}

export interface PairedStepperProps {
  /** Group legend, for example "Trials". */
  legend: string
  succeededLabel: string
  triedLabel: string
  succeeded: number | undefined
  tried: number | undefined
  onChange: (next: { succeeded: number | undefined; tried: number | undefined }) => void
  labels: { fewerSucceeded: string; moreSucceeded: string; fewerTried: string; moreTried: string }
}

/** "X of Y" for trials: two steppers in a fieldset, where Succeeded can never exceed Tried. */
export function PairedStepper({ legend, succeededLabel, triedLabel, succeeded, tried, onChange, labels }: PairedStepperProps) {
  return (
    <fieldset className={styles.paired}>
      <legend className="type-label">{legend}</legend>
      <Stepper
        label={succeededLabel}
        value={succeeded}
        max={tried}
        maxMessage={tried === undefined ? undefined : t('stepper.exceedsTried').replace('{n}', String(tried))}
        decrementLabel={labels.fewerSucceeded}
        incrementLabel={labels.moreSucceeded}
        onChange={(next) => onChange({ succeeded: next, tried })}
      />
      <Stepper
        label={triedLabel}
        value={tried}
        decrementLabel={labels.fewerTried}
        incrementLabel={labels.moreTried}
        onChange={(next) => onChange({ succeeded, tried: next })}
      />
    </fieldset>
  )
}
