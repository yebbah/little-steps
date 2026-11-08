import * as RadixDialog from '@radix-ui/react-dialog'
import { useEffect, useLayoutEffect, useRef, type PointerEvent, type ReactNode } from 'react'
import { t } from '../i18n/messages.ts'
import { Button } from '../ui/Button.tsx'
import { ActionRow } from './ActionRow.tsx'
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

/** A click older than this did not open the modal. */
const RECENT_CLICK_MS = 1000

/**
 * The shared modal (UX-DR28, UX-DR113), on Radix: `role="dialog" aria-modal="true" aria-labelledby`, focus
 * to the heading on open, trapped inside, back to the invoker on close, the page behind inert. Closes on Esc,
 * scrim tap, swipe down on the grabber or Close.
 */
function Modal({ open, onOpenChange, title, description, children, footer, footerLayout = 'free' }: ModalProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const startY = useRef<number | null>(null)
  const { container, visible } = useModalLevel(open, onOpenChange)
  // Radix returns focus only to its own Trigger. Sheets are opened by any button, so the invoker is the control
  // that was just activated, else whatever had focus when the modal was asked to open. A layout effect runs
  // before Radix moves focus into the modal.
  const lastActivated = useRef<{ element: HTMLElement; at: number } | null>(null)
  useEffect(() => {
    // Capture phase: runs before the click handler that opens the modal.
    const remember = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('button, [role="button"], a[href]') : null
      lastActivated.current = target ? { element: target, at: event.timeStamp } : null
    }
    document.addEventListener('click', remember, true)
    return () => document.removeEventListener('click', remember, true)
  }, [])
  const invoker = useRef<HTMLElement | null>(null)
  const wasOpen = useRef(false)
  useLayoutEffect(() => {
    if (!open) {
      wasOpen.current = false
      return
    }
    // The portal container can change while the modal is open; only the moment it opens names the invoker.
    if (wasOpen.current) return
    wasOpen.current = true
    const active = document.activeElement
    const usable = active instanceof HTMLElement && active !== document.body && !container?.contains(active)
    // The control that was just activated is the invoker. Safari does not focus a button on click, so
    // activeElement can be something else (the body, or the page's main after a route change) (#154).
    const activated = lastActivated.current
    lastActivated.current = null
    const recent = activated !== null && performance.now() - activated.at < RECENT_CLICK_MS
    const clicked = recent && activated.element.isConnected && !container?.contains(activated.element) ? activated.element : null
    // Nothing usable has focus or was activated: forget the previous invoker so focus never returns to a stale element.
    invoker.current = clicked ?? (usable ? active : null)
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
          <div className={styles.body} data-part="body">
            {description ? (
              <RadixDialog.Description className="type-body">{description}</RadixDialog.Description>
            ) : null}
            {children}
          </div>
          {footer ? (
            <footer className={footerLayout === 'actions' ? styles.actions : styles.footer}>
              {footerLayout === 'actions' ? <ActionRow>{footer}</ActionRow> : footer}
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
