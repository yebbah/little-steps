import type { Page } from '@playwright/test'

/**
 * Press Tab the way a keyboard user reaches buttons and links. Safari skips them on a plain Tab unless the
 * user turned on "Press Tab to highlight each item" (Option+Tab otherwise), so on WebKit the test presses
 * Option+Tab. The app is unchanged by this: it only decides which key moves focus in the browser (#154).
 */
export async function pressTab(page: Page): Promise<void> {
  const webkit = page.context().browser()?.browserType().name() === 'webkit'
  await page.keyboard.press(webkit ? 'Alt+Tab' : 'Tab')
}
