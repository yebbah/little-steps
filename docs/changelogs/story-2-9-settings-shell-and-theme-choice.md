# Changelog: Story 2.9, Settings shell and theme choice

| | |
|---|---|
| Story | 2.9, issue #104 |
| Epic | 2, App shell and design foundations |
| Branch | feature/epic-02-issue-104-settings-shell-and-theme-choice |
| Commits | `5db7951` (squash-merged) |
| Date | 2026-11-07 |
| Security report | [story-2-9-settings-shell-and-theme-choice.md](../security-reports/story-2-9-settings-shell-and-theme-choice.md) |

## Summary

The Caregiver can open Settings from Family, choose Light, Dark or System, and bring the home-screen install offer back after "Not now". The theme applies at once, is stored on the device and is applied before first paint.

## Added

- Family is now a screen with a link to Settings; Settings is a section of Family at `/family/settings`, and Back returns to Family.
- Settings screen: an `<h1>`, the Story 2.3 title and focus rules, a Light / Dark / System choice on `ChoiceChips` (default System, applied with no reload, announced through the shell status region), and the "Add to home screen" row that calls the Story 2.8 install offer (and says so when the app is already installed).
- The browser bar colour (`theme-color`) follows an explicit choice, and the chip shows the theme the page is really in.
- Catalog keys `screen.settings.*` and `settings.*`.
- `frontend/e2e/tests/settings.spec.ts`.

## Changed

- None. The code follows the Story 2.9 acceptance criteria, so there was no spec change.

## Fixed

- Problems found in review (see the triage log in the story spec), among them the chip disagreeing with the page when storage is blocked.

## Removed or deprecated

- None.

## Security

PASS, no new findings, no new dependency. See [the security report](../security-reports/story-2-9-settings-shell-and-theme-choice.md).

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | None | reviewed, no change |
| Development | Settings route and screen in `frontend/src/shell/` | Layout (updated: one paragraph in the README, one line in `frontend/README.md`) |
| Release | None | reviewed, no change |
| Deployment | None. A reload on `/family/settings` in the app image still needs deferred #124 | reviewed, no change |

## After you pull

Nothing to do.

## Tests

- New component tests (Vitest): Settings (open, Back, default, apply and store, reload, announcement, blocked storage, install row, already installed, structure), theme bar colour and applied choice.
- New Playwright tests in `e2e/tests/settings.spec.ts`: open and Back, theme at once and after reload, applied with every app script blocked, System, install offer, axe in light and dark and with an explicit override.
- Non-regression: `npm test` (291 passed), `npm run test:e2e` (47 passed, 1 skipped), lint, typecheck, build.

## Deferred and known issues

- [#132](https://github.com/yebbah/little-steps/issues/132): follow a theme change made in another tab.
- [#124](https://github.com/yebbah/little-steps/issues/124) (from Story 2.3) stays open.
