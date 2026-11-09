# Changelog: Pull request #109, Epic 2 test framework and red-phase tests for R-01 to R-04

| | |
|---|---|
| Pull request | #109, issue Epic #3 (no issue; not a story) |
| Kind | Test tooling; not a story |
| Origin | Epic 2 test setup ahead of its stories |
| Branch | feature/epic-02-test-framework |
| Commits | e246193, dcc5ff2 (squashed on merge) |
| Date | 2026-11-06 |
| Size | 25 files, +2878 −18 |
| Security report | [pr-109-epic-2-test-framework.md](../security-reports/pr-109-epic-2-test-framework.md) |

## Summary

Adds Playwright with axe and playwright-utils, Testing Library with jsdom for Vitest, four skipped red-phase tests for the high risks R-01 to R-04 (un-skipped with their stories), the Epic 2 test design and the red-phase checklist, README updates and three open action items in sprint status.

## Added

- Added 17 file(s): `.specs/implementation-artifacts/epic-2-atdd-red-phase.md`, `.specs/implementation-artifacts/epic-2-test-design.md`, `frontend/.env.example`, `frontend/e2e/README.md`, `frontend/e2e/support/helpers/a11y.ts`, `frontend/e2e/support/helpers/viewports.ts`, `frontend/e2e/support/merged-fixtures.ts`, `frontend/e2e/tests/api.health.spec.ts`, `frontend/e2e/tests/dialog.spec.ts`, `frontend/e2e/tests/route-change.spec.ts`, `frontend/e2e/tests/shell.smoke.spec.ts`, `frontend/e2e/tsconfig.json` and 5 more

## Changed

- Changed 8 file(s): `.specs/implementation-artifacts/sprint-status.yaml`, `README.md`, `frontend/.gitignore`, `frontend/README.md`, `frontend/package-lock.json`, `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`

## Fixed

- None

## Removed or deprecated

- None

## Security

Dependencies changed in `frontend/package.json` and its lockfile: dev dependencies @axe-core/playwright, @playwright/test, @seontechnologies/playwright-utils, @testing-library/dom, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event and jsdom, and an npm override of `uuid` to ^11.1.1. Verdict: pass with warnings. Details, scan numbers and the scan source are in the [security report](../security-reports/pr-109-epic-2-test-framework.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | Run `npm ci` in `frontend/`, then `npm run test:e2e:install` to download Chromium. New commands: `npm run test:e2e` and `npm run test:e2e:install`. |
| Release | No change |
| Deployment | No change |

README section(s) concerned: Setup, Development (README and frontend/README.md).

README.md was changed in this pull request.

## After you pull

In `frontend/`: `npm ci`, then `npm run test:e2e:install`.

## Tests

Four red-phase tests were added skipped, one per risk R-01 to R-04; each is un-skipped with its story. The new end-to-end tests were not wired into CI yet; that arrived with Story 2.7.

The CI run on the pull request concluded successfully.

## Deferred and known issues

Un-skipping the red-phase tests with their stories; wiring the end-to-end tests into CI (Story 2.7).
