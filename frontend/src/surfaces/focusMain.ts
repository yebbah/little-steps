/**
 * After a control that held focus is removed (Undo, a dismissed banner), focus goes to the shell's
 * main landmark, so a keyboard or screen-reader user keeps their place instead of landing on the body.
 */
export function focusMain(): void {
  document.querySelector<HTMLElement>('main')?.focus()
}
