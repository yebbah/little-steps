import { test, expect, log } from '../support/merged-fixtures'
import { pressTab } from '../support/helpers/keyboard'

// R-03 (Story 2.3): title, focus and announcements on route change.
// Assumes nav links named Today / Goals / Activities / Share / Family (Story 2.3 AC). Adjust if the labels change.
test.describe('route change', () => {
  test('[P0] AC-3 navigating sets the document title, focuses the h1, and keeps one status region', async ({ page }) => {
    // Given the app is open on Today
    await page.goto('/')

    // When the caregiver opens Goals from the nav
    log.step('open Goals from the nav')
    await page.getByRole('link', { name: 'Goals' }).click()

    // Then the title follows "<Screen>: <subject> · LittleSteps" (criterion-defining assertion first)
    await expect(page).toHaveTitle(/^Goals.* · LittleSteps$/)

    // And focus is on the new h1
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused()

    // And the shell has exactly one status region, outside the routed content
    await expect(page.getByRole('status')).toHaveCount(1)
    await expect(page.getByRole('main').getByRole('status')).toHaveCount(0)
  })
})

test.describe('app shell layout and Back', () => {
  test('[P0] bottom nav under 600px, left rail from 600px, content centred at 720px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/today')
    const nav = page.getByRole('navigation', { name: 'Main' })
    const phone = await nav.boundingBox()
    expect(phone!.y).toBeGreaterThan(400)
    expect(phone!.width).toBe(360)
    await expect(page.getByRole('link', { name: 'Today' })).toHaveAttribute('aria-current', 'page')

    await page.setViewportSize({ width: 1280, height: 800 })
    const rail = await nav.boundingBox()
    expect(rail!.x).toBe(0)
    expect(rail!.width).toBeLessThan(200)
    const content = await page.locator('main > div').boundingBox()
    expect(content!.width).toBe(720)
  })

  test('[P0] Skip to content is the first tab stop and focuses main', async ({ page }) => {
    await page.goto('/today')
    await pressTab(page)
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('main')).toBeFocused()
  })

  test('[P0] Back restores the scroll position and the heading focus', async ({ page }) => {
    await page.goto('/today')
    await page.addStyleTag({ content: 'main { min-height: 3000px; }' })
    await page.evaluate(() => window.scrollTo(0, 400))
    await page.getByRole('link', { name: 'Goals' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Goals' })).toBeFocused()
    await page.goBack()
    await expect(page).toHaveTitle(/^Today.* · LittleSteps$/)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300)
    await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeFocused()
  })
})

test.describe('Back restores scroll (UX-DR112)', () => {
  test('[P0] going Back returns to the scroll position the screen had', async ({ page }) => {
    // A short, wide-text viewport makes the placeholder screen taller than the window.
    await page.setViewportSize({ width: 360, height: 400 })
    await page.goto('/today')
    await page.addStyleTag({ content: 'html { font-size: 300% !important; }' })
    await page.evaluate(() => window.scrollTo(0, 120))
    const before = await page.evaluate(() => window.scrollY)
    expect(before).toBeGreaterThan(50)
    await page.getByRole('link', { name: 'Goals' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Goals' })).toBeFocused()
    await page.goBack()
    await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before - 10)
  })
})
