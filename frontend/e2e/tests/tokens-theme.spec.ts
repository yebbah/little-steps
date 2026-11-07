import { test, expect, log } from '../support/merged-fixtures'
import { seriousViolations } from '../support/helpers/a11y'
import { FRAME_WIDTHS, viewport } from '../support/helpers/viewports'

// Story 2.1: theme before first paint, the type root, and the gallery (UX-DR2, UX-DR9, R-01, R-02).
const FLOOR = { light: 'rgb(250, 247, 242)', dark: 'rgb(23, 25, 31)' }

test.describe('theme and type', () => {
  test('[P0] the page follows the device colour scheme by default', async ({ page }) => {
    for (const scheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: scheme })
      await page.goto('/')
      await expect(page.locator('body')).toHaveCSS('background-color', FLOOR[scheme])
    }
  })

  test('[P0] a stored choice is applied before first paint, so there is no flash of the wrong theme', async ({ page }) => {
    // Given Dark is stored while the device is in light mode
    await page.emulateMedia({ colorScheme: 'light' })
    await page.addInitScript(() => localStorage.setItem('littlesteps.theme', 'dark'))

    // When the page loads with the app script blocked, so only the inline script in index.html has run
    log.step('block the app script and read the mode')
    await page.route('**/src/main.tsx', (route) => route.abort())
    await page.goto('/')

    // Then the page is already dark: nothing in the app had to run to get there
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('[P0] a stored Dark choice paints dark on a light device once the styles load', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.addInitScript(() => localStorage.setItem('littlesteps.theme', 'dark'))
    await page.goto('/')
    await expect(page.locator('body')).toHaveCSS('background-color', FLOOR.dark)
  })

  test('[P0] a stored Light choice stays light on a dark device', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.addInitScript(() => localStorage.setItem('littlesteps.theme', 'light'))
    await page.goto('/')
    await expect(page.locator('body')).toHaveCSS('background-color', FLOOR.light)
  })

  test('[P0] body text renders at 17px at default zoom (UX-DR9)', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toHaveCSS('font-size', '17px')
    await expect(page.locator('html')).toHaveCSS('font-size', '16px')
  })

  test('[P1] no font file is requested', async ({ page }) => {
    const fonts: string[] = []
    page.on('request', (r) => r.resourceType() === 'font' && fonts.push(r.url()))
    await page.goto('/')
    expect(fonts).toEqual([])
  })
})

test.describe('component gallery at /dev/gallery', () => {
  for (const [name, width] of Object.entries(FRAME_WIDTHS)) {
    for (const scheme of ['light', 'dark'] as const) {
      test(`[P0] opens and has no serious axe violations at ${name} (${width}px), ${scheme}`, async ({ page }) => {
        await page.setViewportSize(viewport(width))
        await page.emulateMedia({ colorScheme: scheme })

        await page.goto('/dev/gallery')

        await expect(page.getByRole('heading', { level: 1, name: 'Component gallery' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Colour tokens' })).toBeVisible()
        expect(await seriousViolations(page)).toEqual([])
      })
    }
  }

  test('[P0] the Light / Dark toggle changes the page mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/dev/gallery')

    await page.getByRole('button', { name: 'Dark' }).click()

    await expect(page.locator('body')).toHaveCSS('background-color', FLOOR.dark)
    await page.getByRole('button', { name: 'Light' }).click()
    await expect(page.locator('body')).toHaveCSS('background-color', FLOOR.light)
  })

  test('[P1] the focus ring is a real outline, 2px with a 2px offset', async ({ page }) => {
    await page.goto('/dev/gallery')
    // The gallery is a lazy chunk: wait for it to render before pressing Tab (#116).
    await expect(page.getByRole('heading', { level: 1, name: 'Component gallery' })).toBeVisible()
    await page.keyboard.press('Tab')
    const toggle = page.getByRole('button', { name: 'Light' })
    await expect(toggle).toBeFocused()
    await expect(toggle).toHaveCSS('outline-width', '2px')
    await expect(toggle).toHaveCSS('outline-offset', '2px')
    await expect(toggle).toHaveCSS('outline-style', 'solid')
    await expect(toggle).toHaveCSS('outline-color', 'rgb(51, 69, 127)')
  })

  test('[P1] the gallery also opens with a trailing slash', async ({ page }) => {
    await page.goto('/dev/gallery/')
    await expect(page.getByRole('heading', { level: 1, name: 'Component gallery' })).toBeVisible()
  })
})
