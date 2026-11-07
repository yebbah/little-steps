import { test, expect } from '../support/merged-fixtures'
import { seriousViolations } from '../support/helpers/a11y'
import { FRAME_WIDTHS, viewport } from '../support/helpers/viewports'

// Story 2.9: Settings shell and theme choice (UX-DR2).
test.describe('settings', () => {
  test('[P0] Family opens Settings, and Back returns to Family', async ({ page }) => {
    await page.goto('/family')
    await page.getByRole('link', { name: 'Settings' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeFocused()
    await expect(page).toHaveTitle(/^Settings: .* · LittleSteps$/)
    await page.getByRole('link', { name: 'Back to Family' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Family' })).toBeFocused()
  })

  test('[P0] the theme applies at once, survives a reload and is applied before the app starts', async ({ page }) => {
    await page.goto('/family/settings')
    await expect(page.getByRole('radio', { name: 'System' })).toBeChecked()
    await page.getByRole('radio', { name: 'Dark' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.getByRole('status')).toHaveText('Theme set to Dark.')

    await page.reload()
    await expect(page.getByRole('radio', { name: 'Dark' })).toBeChecked()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  })

  test('[P0] the stored theme is applied by the page itself, before any app script runs', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('littlesteps.theme', 'dark'))
    // Without the app's own scripts, only index.html's inline script can have set the theme.
    await page.route(/\/src\/|\/assets\/|\/@vite|\/node_modules\//, (route) => route.abort())
    await page.goto('/family/settings')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.locator('#root')).toBeEmpty()
  })

  test('[P1] choosing System removes the override', async ({ page }) => {
    await page.goto('/family/settings')
    await page.getByRole('radio', { name: 'Dark' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.getByRole('radio', { name: 'System' }).click()
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.*/)
    expect(await page.evaluate(() => localStorage.getItem('littlesteps.theme'))).toBeNull()
  })

  test('[P1] "Add to home screen" opens the offer, which closes with Esc and returns focus', async ({ page }) => {
    await page.goto('/family/settings')
    const row = page.getByRole('button', { name: 'Add to home screen' })
    await row.click()
    await expect(page.getByRole('dialog', { name: 'Add LittleSteps to your home screen' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(row).toBeFocused()
  })

  test('[P0] an explicit Dark choice on a light device has no serious axe violations, with the install offer open', async ({ page }) => {
    await page.setViewportSize(viewport(FRAME_WIDTHS.phone))
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/family/settings')
    await page.getByRole('radio', { name: 'Dark' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    expect(await seriousViolations(page)).toEqual([])
    await page.getByRole('button', { name: 'Add to home screen' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    expect(await seriousViolations(page, '[role="dialog"]')).toEqual([])
  })

  for (const scheme of ['light', 'dark'] as const) {
    test(`[P0] no serious axe violations on Family and Settings, ${scheme}`, async ({ page }) => {
      await page.setViewportSize(viewport(FRAME_WIDTHS.phone))
      await page.emulateMedia({ colorScheme: scheme })
      for (const path of ['/family', '/family/settings']) {
        await page.goto(path)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        expect(await seriousViolations(page), path).toEqual([])
      }
    })
  }
})
