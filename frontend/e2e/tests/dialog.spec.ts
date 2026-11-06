import { test, expect, log } from '../support/merged-fixtures'

// R-04 (Story 2.5): Sheet/Dialog focus management in the component gallery.
// RED PHASE: Sheet, Dialog and the gallery do not exist yet. Remove `.skip` when Story 2.5 registers them.
// Assumes the gallery has a button named "Open sheet" that opens a Sheet. Adjust to the real label.
test.describe('sheet and dialog', () => {
  test.skip('[P0] AC-4 opening a sheet focuses its heading and Esc returns focus to the invoker', async ({ page }) => {
    // Given the gallery shows a Sheet invoker
    await page.goto('/dev/gallery')
    const invoker = page.getByRole('button', { name: 'Open sheet' })

    // When the caregiver opens the sheet
    log.step('open the sheet')
    await invoker.click()

    // Then it is a modal dialog named by its heading, and focus is on that heading (criterion-defining assertion first)
    const dialog = page.getByRole('dialog')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(dialog.getByRole('heading').first()).toBeFocused()
    await expect(dialog).toHaveAccessibleName(/.+/)

    // And Esc closes it and focus returns to the invoker
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(invoker).toBeFocused()
  })
})
