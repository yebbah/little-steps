# Frontend test framework

Three layers, matching the Epic 2 test design (`.specs/test-artifacts/epic-2-test-design.md`):

| Layer | Tool | Where | Command |
|-------|------|-------|---------|
| Unit and component | Vitest 5, Testing Library, jsdom | `src/**/*.test.{ts,tsx}` | `npm test` |
| End-to-end and accessibility | Playwright, axe, playwright-utils | `e2e/tests/*.spec.ts` | `npm run test:e2e` |
| Backend | JUnit 5 (unchanged) | `backend/src/test` | `./mvnw verify` |

## Setup

```bash
cd frontend
npm ci
npm run test:e2e:install   # downloads Chromium (and system deps on Linux)
cp .env.example .env.local # optional
```

## Running

```bash
npm test                          # Vitest, once
npm run test:coverage             # with coverage
npm run test:e2e                  # Playwright; starts Vite in test mode with the gallery on
npx playwright test --headed      # watch it run
npx playwright test --debug       # step through with the inspector
npx playwright test -g "axe"      # by title
E2E_ALL_BROWSERS=true npm run test:e2e   # add WebKit and Firefox (nightly matrix)
BASE_URL=http://localhost:4173 npm run test:e2e   # use a server you already started
E2E_SERVER=preview npm run test:e2e                # build the bundle and test it with vite preview (what the nightly run does)
E2E_REUSE_SERVER=true npm run test:e2e        # reuse a test-mode server already on the port (by default a busy port fails fast)
API_URL=http://localhost:8080 npm run test:e2e    # also run the optional API samples
```

Reports: `playwright-report/` (HTML), `test-results/e2e-junit.xml`, traces and videos in `test-results/e2e/` on failure.

## Layout

```
e2e/
  tests/                    specs (*.spec.ts)
  support/
    merged-fixtures.ts      the only place specs import `test` from
    helpers/a11y.ts         seriousViolations(page): axe, serious and critical only
    helpers/viewports.ts    360 / 768 / 1280 frames, 320 reflow width
src/test/setup.ts           jest-dom matchers and cleanup for Vitest
```

Component tests opt into jsdom with `// @vitest-environment jsdom` on the first line.

## Practices

- Specs import `test`, `expect` and `log` from `../support/merged-fixtures`, never from `@playwright/test` (playwright-utils mandate).
- Select by role and accessible name first (`getByRole`, `getByLabel`). Use `data-testid` only when no accessible name exists. This also keeps tests honest about accessibility.
- Press Tab with `pressTab(page)` from `support/helpers/keyboard.ts`, never `page.keyboard.press('Tab')`: Safari skips buttons and links on a plain Tab (Option+Tab reaches them), so on WebKit the helper presses Option+Tab.
- No `waitForTimeout`. Wait on a condition: web-first `expect`, or `recurse` for eventually consistent state.
- Declare `interceptNetworkCall({ url })` before `page.goto`, await it after, once the app calls an API.
- Every test is independent: no shared state, no order. Tests name their priority: `[P0]`, `[P1]`.
- No sign-in fixture yet. Epic 3 adds the Keycloak `AuthProvider` to `merged-fixtures.ts` (see `auth-session.md`).
- No data factories yet; add faker-based factories under `support/factories/` when the first feature has data.

## CI

The "Frontend" job runs lint, the lint rule tests, typecheck, Vitest and build. The separate job "Frontend: accessibility" runs `npm run test:e2e:install` then `npm run test:e2e` against the Vite test-mode server (the gallery on), and uploads `playwright-report/` and `test-results/`. Pull requests run Chromium only. The scheduled workflow `nightly-e2e.yml` runs all three browsers every night against the built bundle (`E2E_ALL_BROWSERS=true E2E_SERVER=preview`, #134); start it by hand from the Actions tab with "Run workflow".

## Not set up

- Contract (Pact) tests: the frontend calls its own backend in the same repo, so there is no separate provider boundary.

## Accessibility and reflow (Story 2.7)

`e2e/tests/a11y-reflow.spec.ts` is the harness behind the CI job "Frontend: accessibility": axe on every shell screen and the gallery in light and dark, reflow at 320px and 200% text, the reflow rules and the colour-alone checks. Results by screen are in [docs/a11y-passes.md](../../docs/a11y-passes.md).
