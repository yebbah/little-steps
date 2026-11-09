# Changelog: Pull request #156, Return focus to the clicked invoker when the browser does not focus buttons on click

| | |
|---|---|
| Pull request | #156, issue #154 |
| Kind | Fix (accessibility); not a story |
| Origin | Epic 2 WebKit and Firefox run (#144, #134) |
| Branch | feature/epic-02-issue-154-webkit-focus-tests |
| Commits | 5d74f0c (squashed on merge) |
| Date | 2026-11-08 |
| Size | 6 files, +61 −8 |
| Security report | [pr-156-modal-returns-focus-to-clicked-invoker.md](../security-reports/pr-156-modal-returns-focus-to-clicked-invoker.md) |

## Summary

In Safari, a click does not focus a button, so a sheet or dialog recorded the wrong control as its opener and focus never returned to it. The modal now treats the control just activated as the opener. Two Tab-key specs now press Option+Tab on WebKit.

## Added

- `frontend/e2e/support/helpers/keyboard.ts` with `pressTab`.
- A unit test for the click-without-focus case that fails without the fix.

## Changed

- `Modal.tsx` names the invoker once, when the modal opens: the control activated within the last second, else the focused element.
- The skip-link and focus-ring specs use `pressTab`; README records the practice.

## Fixed

- Focus returning to `main` instead of the invoker after closing a sheet or the install offer in WebKit.
- The five formerly failing WebKit specs now pass.

## Removed or deprecated

- None

## Security

No dependency, image or data flow changed. Verdict: pass with warnings (unchanged). Details, scan numbers and the CI run are in the [security report](../security-reports/pr-156-modal-returns-focus-to-clicked-invoker.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | `pressTab(page)` replaces `page.keyboard.press('Tab')` in Playwright specs. |
| Release | No change |
| Deployment | No change |

README section(s) concerned: frontend/e2e/README.md.

README.md was not changed in this pull request.

## After you pull

Nothing to do.

## Tests

Vitest 332 passed (new test fails without the fix); lint and typecheck clean. Playwright on Chromium, Firefox and WebKit: 267 passed, 3 skipped, 0 failed.

All five CI jobs passed on the pull request (backend, frontend, accessibility, scripts, security).

## Deferred and known issues

The result is for Playwright's WebKit build, not Safari itself; no real-Safari check was run.
