import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

const BLOCKING_IMPACTS = ['serious', 'critical']

// Story 2.7 / UX-DR119: no serious or critical axe violations, in light and dark.
// Returns the violations so a failing test prints what broke, not just a count.
export async function seriousViolations(page: Page, scope?: string) {
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  if (scope) builder = builder.include(scope)
  const { violations } = await builder.analyze()
  return violations.filter((v) => v.impact && BLOCKING_IMPACTS.includes(v.impact))
}
