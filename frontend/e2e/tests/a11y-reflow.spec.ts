import type { Page } from '@playwright/test'
import { test, expect } from '../support/merged-fixtures'
import { seriousViolations } from '../support/helpers/a11y'
import { FRAME_WIDTHS, REFLOW_WIDTH, SHORT_VIEWPORT_HEIGHT, viewport } from '../support/helpers/viewports'

// Story 2.7: the accessibility and reflow harness (UX-DR119 to 121, UX-DR123). It runs as its own CI job,
// "Frontend: accessibility", against a test-mode build with the gallery on.

/** Every shell screen: the five destinations, Settings and the not-found page. */
export const SHELL_SCREENS = ['/today', '/goals', '/activities', '/share', '/family', '/family/settings', '/no-such-page'] as const

const schemes = ['light', 'dark'] as const
const widths = Object.values(FRAME_WIDTHS)

/** A user's text-size setting: the root font size, as a percentage of the browser default. */
const setTextSize = (page: Page, percent: number) => page.addStyleTag({ content: `html { font-size: ${percent}% !important; }` })

const screenName = (path: string) => (path === '/no-such-page' ? 'not found' : path)

test.describe('axe: every shell screen and every gallery frame, light and dark (UX-DR119)', () => {
  for (const scheme of schemes) {
    for (const width of widths) {
      test(`[P0] no serious or critical violations on every shell screen at ${width}px, ${scheme}`, async ({ page }) => {
        await page.setViewportSize(viewport(width))
        await page.emulateMedia({ colorScheme: scheme })
        for (const path of SHELL_SCREENS) {
          await page.goto(path)
          await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
          expect(await seriousViolations(page), screenName(path)).toEqual([])
        }
      })

      test(`[P0] no serious or critical violations in the gallery at ${width}px, ${scheme}`, async ({ page }) => {
        await page.setViewportSize(viewport(width))
        await page.emulateMedia({ colorScheme: scheme })
        await page.goto('/dev/gallery')
        await expect(page.getByTestId(`frame-${FRAME_WIDTHS.phone}`)).toBeVisible()
        expect(await seriousViolations(page)).toEqual([])
      })
    }
  }
})

/** Elements whose text could be clipped: controls, labels, nav items, chips. */
const CLIPPABLE = 'button, a, label, legend, [role="status"], nav li, h1, h2, h3, h4, p, span'

async function reflowProblems(page: Page) {
  return page.evaluate((selector) => {
    const root = document.documentElement
    const clipped: string[] = []
    for (const element of document.querySelectorAll<HTMLElement>(selector)) {
      const box = element.getBoundingClientRect()
      if (box.width === 0 || !element.textContent?.trim()) continue
      const style = getComputedStyle(element)
      if (style.visibility === 'hidden' || style.clipPath !== 'none') continue
      const hasOwnText = [...element.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())
      if (!hasOwnText) continue
      // The gallery frames are fixed-width on purpose and scroll inside their own container.
      if (element.closest('[data-testid^="frame-"]')) continue
      // Inline elements report a client width of 0, so only boxes are measured; an ancestor that clips is measured too.
      const isBox = style.display !== 'inline'
      let clippedByAncestor = false
      for (let up = element.parentElement; up && up !== document.body; up = up.parentElement) {
        if (getComputedStyle(up).overflowX !== 'visible' && up.scrollWidth > up.clientWidth + 1 && !up.closest('[data-testid^="frame-"]') && up.getBoundingClientRect().right < box.right - 1) clippedByAncestor = true
      }
      const truncated = (isBox && element.scrollWidth > element.clientWidth + 1 && style.overflowX !== 'visible') || clippedByAncestor
      const clippedTall = isBox && element.scrollHeight > element.clientHeight + 1 && style.overflowY !== 'visible' && element.tagName !== 'DIV'
      const ellipsis = style.textOverflow === 'ellipsis' && isBox && element.scrollWidth > element.clientWidth + 1
      const noWrap = style.whiteSpace === 'nowrap' && element.scrollWidth > element.clientWidth + 1
      if (truncated || ellipsis || noWrap || clippedTall) clipped.push(`${element.tagName.toLowerCase()}: ${element.textContent.trim().slice(0, 40)}`)
    }
    // Name what sticks out, so a failure on another platform (fonts, classic scrollbars) says where.
    const offenders: string[] = []
    if (root.scrollWidth > root.clientWidth + 1) {
      for (const element of document.querySelectorAll<HTMLElement>('body *')) {
        const right = element.getBoundingClientRect().right
        if (right > root.clientWidth + 0.5 && !element.closest('[data-testid^="frame-"]')) {
          offenders.push(`${element.tagName.toLowerCase()}.${String(element.className).slice(0, 40)} right=${right.toFixed(1)} of ${root.clientWidth}`)
        }
      }
      if (offenders.length === 0) offenders.push(`page is ${root.scrollWidth}px wide in a ${root.clientWidth}px window`)
    }
    return { horizontalScroll: root.scrollWidth > root.clientWidth + 1, clipped, offenders }
  }, CLIPPABLE)
}

test.describe('reflow at 320 CSS px and 200% text (UX-DR120)', () => {
  for (const path of [...SHELL_SCREENS, '/dev/gallery']) {
    test(`[P0] ${screenName(path)} has no horizontal scroll and no truncated label`, async ({ page }) => {
      await page.setViewportSize(viewport(REFLOW_WIDTH, 640))
      await page.goto(path)
      await setTextSize(page, 200)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      const problems = await reflowProblems(page)
      expect(problems.clipped).toEqual([])
      // The gallery shows 360, 768 and 1280px frames that scroll inside their own container; the page itself must not.
      expect(problems.offenders).toEqual([])
      expect(problems.horizontalScroll).toBe(false)
    })
  }

  for (const [where, path, opener] of [
    ['the install offer', '/family/settings', 'Add to home screen'],
    ['the gallery sheet', '/dev/gallery', 'Open sheet'],
    ['the gallery dialog', '/dev/gallery', 'Open dialog'],
  ] as const) {
    test(`[P0] ${where} reflows at 320px and 200% text`, async ({ page }) => {
      await page.setViewportSize(viewport(REFLOW_WIDTH, 640))
      await page.goto(path)
      await setTextSize(page, 200)
      await page.getByRole('button', { name: opener }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      const problems = await reflowProblems(page)
      expect(problems.clipped).toEqual([])
      expect(problems.offenders).toEqual([])
      expect(problems.horizontalScroll).toBe(false)
      // Everything in the dialog can be reached: its own scroller holds the content.
      const box = (await page.getByRole('dialog').boundingBox())!
      expect(box.width).toBeLessThanOrEqual(REFLOW_WIDTH + 1)
    })
  }
})

test.describe('reflow rules (UX-DR121)', () => {
  // Positions are measured right after a sheet opens: no slide-in, so they do not move while measured.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  const openDialog = async (page: Page) => {
    await page.goto('/dev/gallery')
    await page.getByRole('button', { name: 'Open dialog' }).click()
    return page.getByRole('dialog')
  }
  const layout = (page: Page) => page.getByRole('dialog').locator('[data-layout]').getAttribute('data-layout')

  test('[P0] two-button footers stack on a phone, with the primary at the bottom', async ({ page }) => {
    await page.setViewportSize(viewport(FRAME_WIDTHS.phone))
    const dialog = await openDialog(page)
    await expect.poll(() => layout(page)).toBe('stack')
    const quiet = (await dialog.getByRole('button', { name: 'Not now' }).boundingBox())!
    const primary = (await dialog.getByRole('button', { name: 'Share', exact: true }).boundingBox())!
    expect(primary.y).toBeGreaterThan(quiet.y)
  })

  test('[P0] two-button footers sit side by side from 400px and at 130% text or less', async ({ page }) => {
    await page.setViewportSize(viewport(FRAME_WIDTHS.tablet))
    const dialog = await openDialog(page)
    await expect.poll(() => layout(page)).toBe('row')
    const quiet = (await dialog.getByRole('button', { name: 'Not now' }).boundingBox())!
    const primary = (await dialog.getByRole('button', { name: 'Share', exact: true }).boundingBox())!
    expect(primary.x).toBeGreaterThan(quiet.x)
    expect(Math.abs(primary.y - quiet.y)).toBeLessThan(6)
  })

  test('[P0] the same footer stacks above 130% text even in a wide container', async ({ page }) => {
    await page.setViewportSize(viewport(FRAME_WIDTHS.desktop))
    await page.goto('/dev/gallery')
    await setTextSize(page, 130)
    await page.getByRole('button', { name: 'Open dialog' }).click()
    await expect.poll(() => layout(page)).toBe('row')
    await page.keyboard.press('Escape')
    await setTextSize(page, 150)
    await page.getByRole('button', { name: 'Open dialog' }).click()
    await expect.poll(() => layout(page)).toBe('stack')
  })

  test('[P0] the 400px container boundary: 399px stacks, 400px sits side by side, buttons full width when stacked', async ({ page }) => {
    // A phone sheet's container is the viewport minus 24px padding and a 1px edge on each side.
    await page.setViewportSize(viewport(449, 800))
    const dialog = await openDialog(page)
    await expect.poll(() => layout(page)).toBe('stack')
    const container = (await dialog.locator('[data-layout]').boundingBox())!
    const button = (await dialog.getByRole('button', { name: 'Share', exact: true }).boundingBox())!
    expect(Math.abs(button.width - container.width)).toBeLessThan(2)
    await page.keyboard.press('Escape')
    await page.setViewportSize(viewport(450, 800))
    await page.getByRole('button', { name: 'Open dialog' }).click()
    await expect.poll(() => layout(page)).toBe('row')
  })

  test('[P0] the 500px height boundary: 499px unpins the nav, 500px keeps it pinned', async ({ page }) => {
    await page.goto('/today')
    const nav = page.getByRole('navigation', { name: 'Main' })
    await page.setViewportSize(viewport(FRAME_WIDTHS.phone, 500))
    await expect(nav).toHaveCSS('position', 'fixed')
    await page.setViewportSize(viewport(FRAME_WIDTHS.phone, 499))
    await expect(nav).toHaveCSS('position', 'static')
  })

  test('[P0] a text-size change while a dialog is open re-lays out its buttons', async ({ page }) => {
    await page.setViewportSize(viewport(FRAME_WIDTHS.desktop))
    await openDialog(page)
    await expect.poll(() => layout(page)).toBe('row')
    await setTextSize(page, 200)
    await expect.poll(() => layout(page)).toBe('stack')
  })

  test('[P0] under 500px tall the bottom nav unpins and follows the content', async ({ page }) => {
    await page.setViewportSize(viewport(FRAME_WIDTHS.phone, 700))
    await page.goto('/today')
    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect(nav).toHaveCSS('position', 'fixed')
    await page.setViewportSize(viewport(FRAME_WIDTHS.phone, SHORT_VIEWPORT_HEIGHT - 20))
    await expect(nav).toHaveCSS('position', 'static')
    await expect(page.locator('html')).toHaveCSS('scroll-padding-bottom', '0px')
    const main = (await page.getByRole('main').boundingBox())!
    expect((await nav.boundingBox())!.y).toBeGreaterThanOrEqual(main.y + main.height - 1)
  })

  test('[P0] under 500px tall a sheet footer unpins: the sheet scrolls as a whole', async ({ page }) => {
    await page.setViewportSize(viewport(FRAME_WIDTHS.phone, SHORT_VIEWPORT_HEIGHT - 20))
    await page.goto('/dev/gallery')
    await page.getByRole('button', { name: 'Open sheet' }).click()
    await expect(page.locator('[role="dialog"] [data-part="body"]')).toHaveCSS('overflow-y', 'visible')
    // The sheet itself scrolls, so a tall body stays reachable on a short screen.
    await expect(page.getByRole('dialog')).toHaveCSS('overflow-y', 'auto')
    const dialog = (await page.getByRole('dialog').boundingBox())!
    expect(dialog.height).toBeLessThanOrEqual(SHORT_VIEWPORT_HEIGHT - 20 - 24 + 1)
  })

  for (const percent of [100, 200]) {
    test(`[P0] scroll-padding-bottom matches the pinned nav height at ${percent}% text`, async ({ page }) => {
      await page.setViewportSize(viewport(FRAME_WIDTHS.phone, 800))
      await page.goto('/today')
      await setTextSize(page, percent)
      const nav = page.getByRole('navigation', { name: 'Main' })
      await expect
        .poll(async () => {
          const navHeight = Math.ceil((await nav.boundingBox())!.height)
          const padding = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).scrollPaddingBottom))
          return Math.abs(padding - navHeight)
        })
        .toBeLessThanOrEqual(1)
    })
  }

  test('[P0] the last line of a screen is never hidden behind the pinned nav at 200% text', async ({ page }) => {
    await page.setViewportSize(viewport(FRAME_WIDTHS.phone, 640))
    await page.goto('/family')
    await setTextSize(page, 200)
    const link = page.getByRole('main').getByRole('link', { name: 'Settings' })
    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect
      .poll(async () => {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        const [l, n] = [(await link.boundingBox())!, (await nav.boundingBox())!]
        return l.y + l.height <= n.y + 1
      })
      .toBe(true)
  })

  test('[P1] chips, the status line and steppers grow with text spacing instead of clipping (WCAG 1.4.12)', async ({ page }) => {
    await page.setViewportSize(viewport(FRAME_WIDTHS.phone))
    await page.goto('/dev/gallery')
    await page.addStyleTag({
      content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }',
    })
    const result = await page.evaluate(() => {
      const bad: string[] = []
      const found = document.querySelectorAll<HTMLElement>('[class*="_chip_"], [class*="_line_"], [class*="_stepper_"], [class*="_field_"]')
      for (const el of found) {
        // A text box that does not grow would be cut off: its own height must hold its content.
        if (el.scrollHeight > el.clientHeight + 1) bad.push(el.className)
      }
      return { bad, checked: found.length }
    })
    expect(result.checked).toBeGreaterThan(5)
    expect(result.bad).toEqual([])
  })
})

test.describe('no state is shown by colour alone (UX-DR123)', () => {
  test('[P0] a selected chip has a check glyph and a heavier label', async ({ page }) => {
    await page.goto('/family/settings')
    const selected = page.getByRole('radio', { name: 'System' }).locator('+ span')
    const unselected = page.getByRole('radio', { name: 'Dark' }).locator('+ span')
    expect(await selected.evaluate((el) => getComputedStyle(el, '::before').content)).toContain('✓')
    expect(await unselected.evaluate((el) => getComputedStyle(el, '::before').content)).not.toContain('✓')
    expect(Number(await selected.evaluate((el) => getComputedStyle(el).fontWeight))).toBeGreaterThan(
      Number(await unselected.evaluate((el) => getComputedStyle(el).fontWeight)),
    )
  })

  test('[P0] the active nav item has a bar and a heavier label, and is marked current', async ({ page }) => {
    await page.goto('/goals')
    const active = page.getByRole('navigation').getByRole('link', { name: 'Goals' })
    const inactive = page.getByRole('navigation').getByRole('link', { name: 'Today' })
    await expect(active).toHaveAttribute('aria-current', 'page')
    expect(await active.evaluate((el) => getComputedStyle(el, '::before').content)).not.toBe('none')
    const bar = await active.evaluate((el) => {
      const style = getComputedStyle(el, '::before')
      return { width: parseFloat(style.width), height: parseFloat(style.height), colour: style.backgroundColor }
    })
    // A 32 by 4px bar: horizontal above the icon on a phone, vertical on the rail.
    expect(Math.max(bar.width, bar.height)).toBeGreaterThanOrEqual(32)
    expect(Math.min(bar.width, bar.height)).toBeGreaterThanOrEqual(4)
    expect(bar.colour).not.toBe('rgba(0, 0, 0, 0)')
    expect(await inactive.evaluate((el) => getComputedStyle(el, '::before').content)).toBe('none')
    expect(Number(await active.evaluate((el) => getComputedStyle(el).fontWeight))).toBeGreaterThan(
      Number(await inactive.evaluate((el) => getComputedStyle(el).fontWeight)),
    )
  })

  test('[P0] source, AI, check and status each carry text', async ({ page }) => {
    await page.goto('/dev/gallery')
    const surfaces = page.getByRole('region', { name: 'Surfaces, feedback and labels' })
    for (const text of ['Care Team', 'Proposed by you · Proposed', 'AI-suggested', 'Please check this', 'Review saved.']) {
      await expect(surfaces.getByText(text, { exact: false }).first()).toBeVisible()
    }
    // The check tag also has a glyph, and the disabled control keeps its label.
    await expect(surfaces.getByText('Please check this').locator('[aria-hidden="true"]')).toHaveText('ⓘ')
  })
})
