import { useState } from 'react'
import { Link } from 'react-router'
import { t, tf, type MessageKey } from '../i18n/messages.ts'
import { offerInstall } from '../pwa/install.ts'
import { StatusLine } from '../surfaces/StatusLine.tsx'
import { appliedThemeChoice, setThemeChoice, isThemeChoice, type ThemeChoice } from '../styles/theme.ts'
import { Button, ChoiceChips } from '../ui/index.ts'
import { useStatus } from './statusContext.ts'
import { FOCUS_KEY_ATTRIBUTE } from './useRouteFocus.ts'
import styles from './SettingsScreen.module.css'

const THEME_CHOICES: readonly ThemeChoice[] = ['light', 'dark', 'system']

/** The Family destination's own screen: for now the way into Settings. */
export function FamilyScreen() {
  return (
    <>
      <h1 tabIndex={-1} className="type-title">
        {t('nav.family')}
      </h1>
      <StatusLine />
      <p className="type-body">{t('screen.family.intro')}</p>
      <Link to="/family/settings" className={`${styles.link} type-label`} {...{ [FOCUS_KEY_ATTRIBUTE]: 'settings' }}>
        {t('settings.open')}
      </Link>
    </>
  )
}

/** Settings, a section of Family (UX-DR2, UX-DR129). Back returns to Family. */
export function SettingsScreen() {
  const { announce } = useStatus()
  const [theme, setTheme] = useState<ThemeChoice>(appliedThemeChoice)

  const choose = (value: string) => {
    if (!isThemeChoice(value) || value === theme) return
    setTheme(value)
    setThemeChoice(value)
    announce(tf('settings.themeChanged', { theme: t(`settings.theme.${value}` as MessageKey) }))
  }

  return (
    <>
      <h1 tabIndex={-1} className="type-title">
        {t('screen.settings.title')}
      </h1>
      <StatusLine />
      <p className="type-body">{t('screen.settings.intro')}</p>
      <Link to="/family" className={`${styles.link} type-label`}>
        {t('settings.back')}
      </Link>

      <div className={styles.section}>
        <ChoiceChips
          mode="single"
          legend={t('settings.theme')}
          options={THEME_CHOICES.map((value) => ({ value, label: t(`settings.theme.${value}` as MessageKey) }))}
          value={theme}
          onChange={choose}
        />
        <Button variant="secondary" onClick={() => offerInstall({ from: 'settings' }) || announce(t('settings.alreadyInstalled'))}>
          {t('settings.addToHome')}
        </Button>
      </div>
    </>
  )
}
