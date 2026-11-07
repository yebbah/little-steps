import * as RadixDialog from '@radix-ui/react-dialog'
import { useLayoutEffect, useRef, type PointerEvent, type ReactNode } from 'react'
import { t } from '../i18n/messages.ts'
import { Button } from '../ui/Button.tsx'
import { focusMain } from './focusMain.ts'
import { useModalLevel } from './modalLevel.ts'
import styles from './Modal.module.css'

/** Downward travel, in px, that counts as a swipe-down to close. */
const SWIPE_CLOSE_DISTANCE = 80

export interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The heading. It names the dialog and receives focus on open. */
  title: string
  children?: ReactNode
  /** Pinned below the scrolling body (for example "Back to practice"). */
  footer?: ReactNode
}

export interface DialogProps extends Omit<SheetProps, 'children' | 'footer'> {
  /** The one sentence under the heading. */
  description: string
  /** At most two buttons, the primary last. Side by side only when there is room. */
  actions: ReactNode
}

interface ModalProps extends SheetProps {
  description?: string
  footerLayout?: 'free' | 'actions'
}

/**
 * The shared modal (UX-DR28, UX-DR113), on Radix: `role="dialog" aria-modal="true" aria-labelledby`, focus
 * to the heading on open, trapped inside, back to the invoker on close, the page behind inert. Closes on Esc,
 * scrim tap, swipe down on the grabber or Close.
 */
function Modal({ open, onOpenChange, title, description, children, footer, footerLayout = 'free' }: ModalProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const startY = useRef<number | null>(null)
  const { container, visible } = useModalLevel(open, onOpenChange)
  // Radix returns focus only to its own Trigger. Sheets are opened by any button, so the invoker is whatever
  // had focus when the modal was asked to open. A layout effect runs before Radix moves focus into the modal.
  const invoker = useRef<HTMLElement | null>(null)
  useLayoutEffect(() => {
    if (open && document.activeElement instanceof HTMLElement && document.activeElement !== document.body && !container?.contains(document.activeElement)) {
      invoker.current = document.activeElement
    }
  }, [open, container])

  const swipeStart = (event: PointerEvent) => {
    startY.current = event.clientY
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
  const swipeMove = (event: PointerEvent) => {
    if (startY.current !== null && event.clientY - startY.current > SWIPE_CLOSE_DISTANCE) {
      startY.current = null
      onOpenChange(false)
    }
  }
  const swipeEnd = () => {
    startY.current = null
  }

  return (
    <RadixDialog.Root open={visible} onOpenChange={onOpenChange}>
      <RadixDialog.Portal container={container}>
        <RadixDialog.Overlay className={styles.overlay} />
        <RadixDialog.Content
          className={styles.content}
          aria-modal="true"
          {...(description ? {} : { 'aria-describedby': undefined })}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            titleRef.current?.focus()
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            if (invoker.current?.isConnected) invoker.current.focus()
            else focusMain()
          }}
        >
          <div className={styles.grabber} aria-hidden="true" onPointerDown={swipeStart} onPointerMove={swipeMove} onPointerUp={swipeEnd} onPointerCancel={swipeEnd}>
            <span className={styles.grabberBar} />
          </div>
          <header className={styles.header}>
            <RadixDialog.Title ref={titleRef} tabIndex={-1} className={`${styles.title} type-heading`}>
              {title}
            </RadixDialog.Title>
            <RadixDialog.Close asChild>
              <Button variant="quiet" className={styles.close}>
                {t('surface.close')}
              </Button>
            </RadixDialog.Close>
          </header>
          <div className={styles.body}>
            {description ? (
              <RadixDialog.Description className="type-body">{description}</RadixDialog.Description>
            ) : null}
            {children}
          </div>
          {footer ? (
            <footer className={footerLayout === 'actions' ? styles.actions : styles.footer}>
              {footerLayout === 'actions' ? <div className={styles.actionRow}>{footer}</div> : footer}
            </footer>
          ) : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

/** A sheet: Log a moment, Practice options, Coach Tips. Full width on phones, centred from 600px. */
export function Sheet(props: SheetProps) {
  return <Modal {...props} />
}

/** A confirmation dialog: the heading, one sentence and up to two buttons. */
export function Dialog({ actions, ...rest }: DialogProps) {
  return <Modal {...rest} footer={actions} footerLayout="actions" />
}
