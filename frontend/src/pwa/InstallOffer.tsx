import { t } from '../i18n/messages.ts'
import { Dialog } from '../surfaces/Modal.tsx'
import { Button } from '../ui/Button.tsx'
import { acceptInstall, declineInstall, useInstallOffer } from './install.ts'

/**
 * The install offer (UX-DR129), mounted once in the shell. With the browser's own prompt it offers
 * "Add to home screen"; where there is none it shows short instructions, with no browser named.
 */
export function InstallOffer() {
  const offer = useInstallOffer()
  const prompt = offer.open && offer.mode === 'prompt'
  return (
    <Dialog
      open={offer.open}
      onOpenChange={(open) => {
        if (!open) declineInstall()
      }}
      title={t('pwa.title')}
      description={prompt ? t('pwa.body') : t('pwa.instructions')}
      actions={
        prompt ? (
          <>
            <Button variant="quiet" onClick={declineInstall}>
              {t('confirm.notNow')}
            </Button>
            <Button onClick={() => void acceptInstall()}>{t('pwa.add')}</Button>
          </>
        ) : (
          <Button onClick={declineInstall}>{t('pwa.gotIt')}</Button>
        )
      }
    />
  )
}
