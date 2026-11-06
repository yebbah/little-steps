import { test, expect, log } from '../support/merged-fixtures'

// R-03 (Story 2.3): title, focus and announcements on route change.
// RED PHASE: the router, nav and status region do not exist yet. Remove `.skip` when Story 2.3 lands.
// Assumes nav links named Today / Goals / Activities / Share / Family (Story 2.3 AC). Adjust if the labels change.
test.describe('route change', () => {
  test.skip('[P0] AC-3 navigating sets the document title, focuses the h1, and keeps one status region', async ({ page }) => {
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
