import { mergeTests, test as base } from '@playwright/test'
import { log } from '@seontechnologies/playwright-utils'
import { test as apiRequestFixture } from '@seontechnologies/playwright-utils/api-request/fixtures'
import { test as recurseFixture } from '@seontechnologies/playwright-utils/recurse/fixtures'
import { test as interceptFixture } from '@seontechnologies/playwright-utils/intercept-network-call/fixtures'
import { test as networkErrorFixture } from '@seontechnologies/playwright-utils/network-error-monitor/fixtures'

// The app asks `GET /api/v1/session` when it starts (the data layer, Story 25.2). The UI suite runs without a
// backend, and the network error monitor fails a test on a 5xx, so the session is answered here. Set `API_URL`
// to run against a real backend instead.
const demoSession = {
  caregiverId: '01900000-0000-7000-8000-0000000000a1',
  sub: 'demo-a',
  displayName: 'Demo A',
  familyId: '01900000-0000-7000-8000-000000000001',
  demo: true,
  caregivers: [{ id: '01900000-0000-7000-8000-0000000000a1', displayName: 'Demo A' }],
}
const sessionStub = base.extend({
  context: async ({ context }, provide) => {
    if (!process.env.API_URL) {
      await context.route('**/api/v1/session', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(demoSession) }),
      )
    }
    await provide(context)
  },
})

// The only place specs import `test` from. No auth fixture yet: sign-in arrives in Epic 3, and
// auth-session is added here then (an AuthProvider for Keycloak, see auth-session.md).
export const test = mergeTests(sessionStub, apiRequestFixture, recurseFixture, interceptFixture, networkErrorFixture)

export { expect } from '@playwright/test'
export { log }
