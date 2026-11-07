import { test, expect, log } from '../support/merged-fixtures'
import { seriousViolations } from '../support/helpers/a11y'
import { FRAME_WIDTHS, viewport } from '../support/helpers/viewports'

// Sample UI test: the shell loads on Today, has its name as h1, and passes axe.
// There is no application API call yet. When one exists, declare `interceptNetworkCall({ url })`
// before `page.goto` and await it after (intercept-network-call.md).
test.describe('app shell smoke', () => {
  for (const [name, width] of Object.entries(FRAME_WIDTHS)) {
    test(`[P0] renders the Today screen and has no serious axe violations at ${name} (${width}px)`, async ({ page }) => {
      // Given a viewport of this width
      await page.setViewportSize(viewport(width))

      // When the app opens
      log.step(`open / at ${width}px`)
      await page.goto('/')

      // Then the h1 names the screen and axe finds nothing serious or critical
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Today')
      expect(await seriousViolations(page)).toEqual([])
    })
  }
})
