import { useState } from 'react'
import { Button, ChoiceChips, DisclosureRow, PairedStepper, Stepper, TextField } from '../ui/index.ts'
import styles from './Controls.module.css'
import { g } from './strings.ts'

const FRAME_WIDTHS = [360, 768, 1280] as const

/** Every core control in each state its spec names. Rendered once per frame width. */
export function ControlsShowcase() {
  const [where, setWhere] = useState<string | undefined>('home')
  const [helped, setHelped] = useState<string[]>(['tip'])
  const [minutes, setMinutes] = useState<number | undefined>(0)
  const [minutesSet, setMinutesSet] = useState<number | undefined>(3)
  const [trials, setTrials] = useState<{ succeeded: number | undefined; tried: number | undefined }>({ succeeded: 3, tried: 5 })
  const [trialsError, setTrialsError] = useState<{ succeeded: number | undefined; tried: number | undefined }>({ succeeded: 7, tried: 5 })
  const pairedLabels = {
    fewerSucceeded: g('fewerSucceeded'),
    moreSucceeded: g('moreSucceeded'),
    fewerTried: g('fewerTried'),
    moreTried: g('moreTried'),
  }
  const variants = ['primary', 'secondary', 'quiet', 'danger'] as const

  return (
    <div className={styles.showcase}>
      <h4 className="type-label">{g('buttons')}</h4>
      <div className={styles.row}>
        {variants.map((variant) => (
          <Button key={variant} variant={variant}>
            {g(variant)}
          </Button>
        ))}
      </div>
      <div className={styles.row}>
        {variants.map((variant) => (
          <Button key={variant} variant={variant} disabled>
            {g(variant)} {g('disabledSuffix')}
          </Button>
        ))}
      </div>
      <div className={styles.row}>
        <Button variant="secondary" className={styles.focusSample}>
          {g('focusSample')}
        </Button>
      </div>

      <h4 className="type-label">{g('fields')}</h4>
      <TextField label={g('fieldRest')} />
      <TextField label={g('fieldFilled')} defaultValue={g('fieldFilledValue')} />
      <TextField label={g('fieldError')} error={g('fieldErrorText')} />

      <ChoiceChips
        mode="single"
        legend={g('chipsSingle')}
        options={[
          { value: 'home', label: g('chipHome') },
          { value: 'outside', label: g('chipOutside') },
          { value: 'school', label: g('chipSchool') },
        ]}
        value={where}
        onChange={setWhere}
      />
      <ChoiceChips
        mode="multi"
        legend={g('chipsMulti')}
        options={[
          { value: 'tip', label: g('chipTip') },
          { value: 'cue', label: g('chipCue') },
          { value: 'toy', label: g('chipPlay') },
        ]}
        value={helped}
        onChange={setHelped}
      />

      <h4 className="type-label">{g('steppers')}</h4>
      <Stepper label={g('minutes')} value={minutes} onChange={setMinutes} decrementLabel={g('fewerMinutes')} incrementLabel={g('moreMinutes')} />
      <Stepper label={g('minutes')} value={minutesSet} onChange={setMinutesSet} decrementLabel={g('fewerMinutes')} incrementLabel={g('moreMinutes')} />
      <PairedStepper
        legend={g('trials')}
        succeededLabel={g('succeeded')}
        triedLabel={g('tried')}
        succeeded={trials.succeeded}
        tried={trials.tried}
        onChange={setTrials}
        labels={pairedLabels}
      />
      <PairedStepper
        legend={g('pairedError')}
        succeededLabel={g('succeeded')}
        triedLabel={g('tried')}
        succeeded={trialsError.succeeded}
        tried={trialsError.tried}
        onChange={setTrialsError}
        labels={pairedLabels}
      />

      <h4 className="type-label">{g('disclosures')}</h4>
      <DisclosureRow label={g('disclosureDashed')}>
        <p className="type-body-sm">{g('disclosureBody')}</p>
      </DisclosureRow>
      <DisclosureRow label={g('disclosureSolid')} edge="solid" defaultExpanded>
        <p className="type-body-sm">{g('disclosureBody')}</p>
      </DisclosureRow>
    </div>
  )
}

/** The three fixed-width frames (UX-DR110): the same controls at phone, tablet and desktop widths. */
export function ControlsFrames() {
  return (
    <div className={styles.frames}>
      {FRAME_WIDTHS.map((width) => (
        <section key={width} className={styles.frame} style={{ width }} data-testid={`frame-${width}`} aria-label={`${g('frame')} ${width}`}>
          <h3 className="type-meta">
            {g('frame')} {width}
          </h3>
          <ControlsShowcase />
        </section>
      ))}
    </div>
  )
}
