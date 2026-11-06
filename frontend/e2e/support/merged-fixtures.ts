import { mergeTests } from '@playwright/test'
import { log } from '@seontechnologies/playwright-utils'
import { test as apiRequestFixture } from '@seontechnologies/playwright-utils/api-request/fixtures'
import { test as recurseFixture } from '@seontechnologies/playwright-utils/recurse/fixtures'
import { test as interceptFixture } from '@seontechnologies/playwright-utils/intercept-network-call/fixtures'
import { test as networkErrorFixture } from '@seontechnologies/playwright-utils/network-error-monitor/fixtures'

// The only place specs import `test` from. No auth fixture yet: sign-in arrives in Epic 3, and
// auth-session is added here then (an AuthProvider for Keycloak, see auth-session.md).
export const test = mergeTests(apiRequestFixture, recurseFixture, interceptFixture, networkErrorFixture)

export { expect } from '@playwright/test'
export { log }
