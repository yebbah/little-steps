# Changelog: Pull request #161, Nightly Chromium, WebKit and Firefox run on the built bundle

| | |
|---|---|
| Pull request | #161, issue #134 |
| Kind | CI; not a story |
| Origin | Epic 2 retrospective T1; AD-28 (the recorded run found #154) |
| Branch | feature/epic-02-issue-134-nightly-browser-run |
| Commits | e30cdcf (squashed on merge) |
| Date | 2026-11-08 |
| Size | 8 files, +85 −4 |
| Security report | [pr-161-nightly-browser-run.md](../security-reports/pr-161-nightly-browser-run.md) |

## Summary

A scheduled workflow runs the whole Playwright suite on Chromium, WebKit and Firefox every night against the built bundle. Testing the bundle exposed a race in the scrim-tap spec, which now waits for the sheet's animation.

## Added

- `.github/workflows/nightly-e2e.yml` (03:17 UTC and manual start), read-only token, actions pinned to SHAs.
- `E2E_SERVER=preview` in `playwright.config.ts` and `test:e2e:install:all`.
- Workflow guards in `deploy/tests/ci-workflow.test.sh`.

## Changed

- CONTRIBUTING, README and `frontend/e2e/README.md` describe the nightly run.

## Fixed

- A race in the scrim-tap spec (5 of 5 failures on the bundle, 1 of 5 on the dev server).

## Removed or deprecated

- None

## Security

A new scheduled workflow with read-only permissions and the same pinned actions as `ci.yml`. Verdict: pass with warnings (unchanged). Details, scan numbers and the scan source are in the [security report](../security-reports/pr-161-nightly-browser-run.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | `E2E_SERVER=preview npm run test:e2e` tests the built bundle. |
| Release | A nightly run now exists; a red night is a defect to raise as an issue. |
| Deployment | No change |

README section(s) concerned: Continuous integration.

README.md was changed in this pull request.

## After you pull

Nothing to do. Start the workflow from the Actions tab with "Run workflow" to check it.

## Tests

`ci-workflow.test.sh`: 46 passing. Three browsers on the built bundle, run locally: 267 passed, 3 skipped, 0 failed; the first manual run on GitHub: 267 passed (run 42451831509).

All five CI jobs passed on the pull request (backend, frontend, accessibility, scripts, security).

## Deferred and known issues

None.
