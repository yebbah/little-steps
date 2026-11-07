import { Link } from 'react-router'
import { t } from '../i18n/messages.ts'
import type { MessageKey } from '../i18n/messages.ts'
import { FOCUS_KEY_ATTRIBUTE } from './useRouteFocus.ts'

/** A placeholder destination: an h1 (the focus target on arrival) and one line of catalog copy. */
export function Screen({ titleKey, introKey }: { titleKey: MessageKey; introKey: MessageKey }) {
  return (
    <>
      <h1 tabIndex={-1} className="type-title">
        {t(titleKey)}
      </h1>
      <p className="type-body">{t(introKey)}</p>
    </>
  )
}

export function NotFoundScreen() {
  return (
    <>
      <Screen titleKey="screen.notFound.title" introKey="screen.notFound.intro" />
      <Link to="/today" {...{ [FOCUS_KEY_ATTRIBUTE]: 'home' }}>
        {t('screen.notFound.back')}
      </Link>
    </>
  )
}
