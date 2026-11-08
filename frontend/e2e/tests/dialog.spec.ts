import { test, expect, log } from '../support/merged-fixtures'
import { seriousViolations } from '../support/helpers/a11y'
import { FRAME_WIDTHS, viewport } from '../support/helpers/viewports'

// R-04 (Story 2.5): Sheet and Dialog focus management in the component gallery.
test.describe('sheet and dialog', () => {
  test('[P0] AC-4 opening a sheet focuses its heading and Esc returns focus to the invoker', async ({ page }) => {
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

  test('[P0] focus stays inside the sheet while Tab is pressed, and the page behind is inert', async ({ page }) => {
    await page.goto('/dev/gallery')
    await page.getByRole('button', { name: 'Open sheet' }).click()
    const dialog = page.getByRole('dialog')
    await expect(page.locator('#root')).toHaveAttribute('inert', '')
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab')
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true)
    }
  })

  test('[P1] Close and a tap on the scrim both close the sheet and return focus to the invoker', async ({ page }) => {
    await page.goto('/dev/gallery')
    const invoker = page.getByRole('button', { name: 'Open sheet' })
    await invoker.click()
    await page.getByRole('button', { name: 'Close' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(invoker).toBeFocused()

    await invoker.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // The scrim only takes a tap once the sheet has finished opening: wait for its animation, not a fixed time.
    await page.getByRole('dialog').evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)))
    await page.mouse.click(5, 5)
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(invoker).toBeFocused()
  })

  test('[P1] on a phone the sheet is full width and scrolls within the screen height', async ({ page }) => {
    await page.setViewportSize(viewport(FRAME_WIDTHS.phone))
    await page.goto('/dev/gallery')
    await page.getByRole('button', { name: 'Open sheet' }).click()
    const box = (await page.getByRole('dialog').boundingBox())!
    expect(box.width).toBeGreaterThanOrEqual(FRAME_WIDTHS.phone - 2)
    expect(box.height).toBeLessThanOrEqual(viewport(FRAME_WIDTHS.phone).height - 24)
  })

  test('[P1] from 600px the sheet is centred and at most 560px wide', async ({ page }) => {
    await page.setViewportSize(viewport(FRAME_WIDTHS.tablet))
    await page.goto('/dev/gallery')
    await page.getByRole('button', { name: 'Open sheet' }).click()
    const box = (await page.getByRole('dialog').boundingBox())!
    expect(box.width).toBeLessThanOrEqual(560)
    expect(Math.abs(box.x + box.width / 2 - FRAME_WIDTHS.tablet / 2)).toBeLessThan(2)
  })

  test('[P1] with reduced motion the sheet appears without an animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/dev/gallery')
    await page.getByRole('button', { name: 'Open sheet' }).click()
    await expect(page.getByRole('dialog')).toHaveCSS('animation-name', 'none')
  })

  for (const scheme of ['light', 'dark'] as const) {
    test(`[P0] no serious axe violations in the surfaces section and an open sheet, ${scheme}`, async ({ page }) => {
      await page.setViewportSize(viewport(FRAME_WIDTHS.phone))
      await page.emulateMedia({ colorScheme: scheme })
      await page.goto('/dev/gallery')
      await expect(page.getByRole('heading', { name: 'Surfaces, feedback and labels' })).toBeVisible()
      expect(await seriousViolations(page, '#gallery-surfaces')).toEqual([])
      await page.getByRole('button', { name: 'Open sheet' }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      expect(await seriousViolations(page, '[role="dialog"]')).toEqual([])
    })
  }
})
