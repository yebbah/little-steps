import { test, expect } from '../support/merged-fixtures'

// Story 2.2: Domain tints and icon tiles as drawn in the browser (UX-DR3, UX-DR4, UX-DR5).
test.describe('Domain tints and icons in the gallery', () => {
  test('[P1] a Domain tag shows its label on the family tint, in light and dark', async ({ page }) => {
    const tints = { light: 'rgb(214, 238, 220)', dark: 'rgb(31, 54, 40)' }
    for (const scheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: scheme })
      await page.goto('/dev/gallery')
      const tag = page.getByText('Early motor skills')
      await expect(tag).toBeVisible()
      await expect(tag).toHaveCSS('background-color', tints[scheme])
    }
  })

  test('[P1] icon tiles are 76, 56 and 36px, flat, with a 2.4px stroke', async ({ page }) => {
    await page.goto('/dev/gallery')
    for (const size of [76, 56, 36]) {
      const tile = page.locator(`[data-size="${size}"]`).first()
      await expect(tile).toHaveCSS('width', `${size}px`)
      await expect(tile).toHaveCSS('box-shadow', 'none')
      await expect(tile.locator('svg path, svg rect, svg circle').first()).toHaveCSS('stroke-width', '2.4px')
    }
    await expect(page.locator('[data-size="36"]').first()).toHaveCSS('border-radius', '12px')
    await expect(page.locator('[data-size="56"]').first()).toHaveCSS('border-radius', '20px')
  })
})
