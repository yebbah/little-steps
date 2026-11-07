import { useId } from 'react'
import styles from './ChoiceChips.module.css'

export interface ChoiceOption {
  value: string
  label: string
}

type Common = { legend: string; options: readonly ChoiceOption[]; className?: string }

export type ChoiceChipsProps =
  | (Common & { mode: 'single'; value: string | undefined; onChange: (value: string) => void })
  | (Common & { mode: 'multi'; value: readonly string[]; onChange: (value: string[]) => void })

/**
 * A group of choice chips (UX-DR19). Single select is native radios (arrow keys move the selection with
 * focus); multi select is native checkboxes (Space toggles one chip). A selected chip shows a check glyph
 * and a heavier label, so selection is never colour alone.
 */
export function ChoiceChips(props: ChoiceChipsProps) {
  const name = useId()
  const isSelected = (value: string) => (props.mode === 'single' ? props.value === value : (props.value ?? []).includes(value))
  const toggle = (value: string) => {
    if (props.mode === 'single') props.onChange(value)
    else {
      const current = props.value ?? []
      props.onChange(current.includes(value) ? current.filter((v) => v !== value) : [...current, value])
    }
  }
  return (
    <fieldset className={[styles.group, props.className].filter(Boolean).join(' ')}>
      <legend className="type-label">{props.legend}</legend>
      <div className={styles.chips}>
        {props.options.map((option) => (
          <label key={option.value} className={styles.chip}>
            <input
              className={styles.input}
              type={props.mode === 'single' ? 'radio' : 'checkbox'}
              name={name}
              value={option.value}
              checked={isSelected(option.value)}
              onChange={() => toggle(option.value)}
            />
            <span className={`${styles.text} type-label`}>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
