# Changelog: Story 2.3, App shell, navigation and focus management

| | |
|---|---|
| Story | 2.3, issue #37 |
| Epic | 2, App shell |
| Branch | feature/epic-02-issue-37-app-shell-navigation-and-focus-management |
| Commits | c710736 |
| Date | 2026-11-07 |
| Security report | [story-2-3-app-shell-navigation-and-focus-management.md](../security-reports/story-2-3-app-shell-navigation-and-focus-management.md) |

## Summary

The app gets a shell: five places reachable from a bottom nav or a left rail, a skip link, landmarks, one status region and a rule that every route change sets the title and focuses the page heading. Later screens plug into it instead of inventing their own navigation and focus handling.

## Added

- `frontend/src/shell/`: router and routes, `AppShell`, nav items with line icons and the active bar, placeholder screens for Today, Goals, Activities, Share and Family, a not-found screen, `useStatus()` with the single status region, and the route focus hook (title, h1 focus, Back restores scroll and focus).
- Catalog keys under `nav.` and `screen.`.
- Dependency `react-router` 8.5.0 (exact pin).
- Tests: 15 new Vitest tests (shell, App) and 3 Playwright tests (layout at 360 and 1280px, skip link, Back with scroll); the red-phase route-change test is un-skipped.

## Changed

- `App.tsx` mounts the router instead of a bare `<main>`. The first screen is Today.

## Fixed

- Review findings fixed before the story closed: repeat messages were silent, announcements could precede navigation, Back focus undid the restored scroll. See the spec's Review Triage Log.

## Removed or deprecated

- The two old App tests that asserted the bare shell (replaced by the new ones).

## Security

One new runtime dependency and no data handling. See the [security report](../security-reports/story-2-3-app-shell-navigation-and-focus-management.md): PASS, no blocking findings.

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | `npm ci` installs `react-router` | reviewed, no change |
| Development | Routes work in `npm run dev` | Development (new "App shell and navigation" paragraph) |
| Release | No change | reviewed, no change |
| Deployment | Deep links 404 in the app image until #124 | Development |

## After you pull

Run `(cd frontend && npm ci)`.

## Tests

`(cd frontend && npm test)`: 202 passed, 0 failed. `(cd frontend && npm run test:e2e)`: 32 passed, 2 skipped (unchanged from before). Lint, typecheck and build pass.

## Deferred and known issues

- [#124](https://github.com/yebbah/little-steps/issues/124): serve index.html for client routes in the app image (target 2027-01-05).
- [#125](https://github.com/yebbah/little-steps/issues/125): nav under text zoom, short viewports and safe-area inset (Stories 2.7 and 2.8, target 2027-01-05).
