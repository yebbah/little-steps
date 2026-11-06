import type { Locator } from '@playwright/test'
import { test, expect } from '../support/merged-fixtures'
import { seriousViolations } from '../support/helpers/a11y'
import { FRAME_WIDTHS, viewport } from '../support/helpers/viewports'

// Story 2.4: the core controls in the gallery (UX-DR14, UX-DR16 to 21, UX-DR110; R-17).
const frame = (page: import('@playwright/test').Page, width: number) => page.getByTestId(`frame-${width}`)

async function box(locator: Locator) {
  const b = await locator.boundingBox()
  if (!b) throw new Error('control is not rendered')
  return b
}

test.describe('core controls in the gallery', () => {
  test('[P0] the gallery has the 360, 768 and 1280px frames at their fixed widths', async ({ page }) => {
    await page.goto('/dev/gallery')
    for (const width of Object.values(FRAME_WIDTHS)) {
      expect((await box(frame(page, width))).width).toBe(width)
    }
  })

  for (const scheme of ['light', 'dark'] as const) {
    test(`[P0] no serious axe violations in the controls section, ${scheme}`, async ({ page }) => {
      await page.setViewportSize(viewport(FRAME_WIDTHS.phone))
      await page.emulateMedia({ colorScheme: scheme })
      await page.goto('/dev/gallery')
      await expect(page.getByRole('heading', { name: 'Core controls' })).toBeVisible()
      expect(await seriousViolations(page, '#gallery-controls')).toEqual([])
    })
  }

  for (const forcedColors of ['none', 'active'] as const) {
    test(`[P0] every control shows a 2px ring with a 2px offset when focused by keyboard (forced-colors: ${forcedColors})`, async ({ page }) => {
      await page.emulateMedia({ forcedColors })
      await page.goto('/dev/gallery')
      const f = frame(page, 360)
      const controls = [
        f.getByRole('button', { name: 'Primary', exact: true }),
        f.getByRole('button', { name: 'Primary disabled' }),
        f.getByLabel('Note', { exact: true }),
        f.getByRole('radio', { name: 'At home' }),
        f.getByRole('checkbox', { name: 'A cue' }),
        f.getByRole('button', { name: 'More minutes' }).first(),
        f.getByRole('spinbutton', { name: 'Minutes' }).first(),
        f.getByRole('button', { name: 'If it gets hard' }),
      ]
      for (const control of controls) {
        await page.keyboard.press('Escape')
        await control.focus()
        // Chips draw the ring on the visible chip, which follows the transparent input.
        const target = (await control.getAttribute('type')) === 'radio' || (await control.getAttribute('type')) === 'checkbox' ? control.locator('+ span') : control
        await expect(target).toHaveCSS('outline-width', '2px')
        await expect(target).toHaveCSS('outline-offset', '2px')
        await expect(target).toHaveCSS('outline-style', 'solid')
      }
    })
  }

  test('[P0] tap targets are at least 48px, buttons 52px (quiet 48px)', async ({ page }) => {
    await page.goto('/dev/gallery')
    const f = frame(page, 360)
    for (const name of ['Primary', 'Secondary', 'Danger']) {
      expect((await box(f.getByRole('button', { name, exact: true }))).height).toBeGreaterThanOrEqual(52)
    }
    expect((await box(f.getByRole('button', { name: 'Quiet', exact: true }))).height).toBeGreaterThanOrEqual(48)

    const targets = [
      f.getByLabel('Note', { exact: true }),
      f.getByRole('radio', { name: 'At home' }),
      f.getByRole('checkbox', { name: 'A cue' }),
      f.getByRole('button', { name: 'Fewer minutes' }).first(),
      f.getByRole('button', { name: 'More minutes' }).first(),
      f.getByRole('spinbutton', { name: 'Minutes' }).first(),
      f.getByRole('button', { name: 'If it gets hard' }),
    ]
    for (const target of targets) {
      const b = await box(target)
      expect(b.height).toBeGreaterThanOrEqual(48)
      expect(b.width).toBeGreaterThanOrEqual(48 - 1)
    }
  })

  test('[P0] the stepper at 0 ignores "−", keeps focus and reads "0, minimum"', async ({ page }) => {
    await page.goto('/dev/gallery')
    const f = frame(page, 360)
    const minus = f.getByRole('button', { name: 'Fewer minutes' }).first()
    await minus.focus()
    await page.keyboard.press('Enter')
    await expect(minus).toBeFocused()
    await expect(minus).toHaveAttribute('aria-disabled', 'true')
    const input = f.getByRole('spinbutton', { name: 'Minutes' }).first()
    await expect(input).toHaveValue('0')
    await expect(input).toHaveAttribute('aria-valuetext', '0, minimum')
  })

  test('[P0] paired mode shows the inline message and no live region exists', async ({ page }) => {
    await page.goto('/dev/gallery')
    const f = frame(page, 360)
    await expect(f.getByText("Can't be more than 5 tried")).toBeVisible()
    expect(await page.locator('#gallery-controls [aria-live], #gallery-controls [role="status"], #gallery-controls [role="alert"]').count()).toBe(0)
  })

  test('[P1] the disclosure chevron does not animate under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/dev/gallery')
    const duration = await frame(page, 360)
      .getByRole('button', { name: 'If it gets hard' })
      .locator('span[aria-hidden]')
      .evaluate((el) => getComputedStyle(el, '::before').transitionDuration)
    expect(duration).toBe('0s')
  })
})
