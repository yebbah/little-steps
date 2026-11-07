# Changelog: Story 2.7, Responsive reflow and accessibility test harness

| | |
|---|---|
| Story | 2.7, issue #41 |
| Epic | 2, App shell and design foundations |
| Branch | feature/epic-02-issue-41-responsive-reflow-and-accessibility-test-harness |
| Commits | see `git log` on the branch (one feature commit) |
| Date | 2026-11-07 |
| Security report | [story-2-7-responsive-reflow-and-accessibility-test-harness.md](../security-reports/story-2-7-responsive-reflow-and-accessibility-test-harness.md) |

## Summary

Every screen now reflows for large text, a short viewport and a screen reader, and a CI job proves it on every pull request: axe on every shell screen and the gallery frames in light and dark, no horizontal scroll or clipped label at 320px and 200% text, the reflow rules and no state shown by colour alone.

## Added

- Reflow rules (UX-DR121): the bottom nav's measured height drives the content padding and `scroll-padding-bottom` at any text size; under 500px tall the bottom nav and sheet footers unpin; `ActionRow` puts two buttons side by side only at a container of 400px or more and a text scale of 130% or less, otherwise stacked with the primary at the bottom (Dialog actions use it).
- CI job "Frontend: accessibility" (Playwright with axe against the test-mode gallery build) and the `accessibility-reports` artifact.
- `frontend/e2e/tests/a11y-reflow.spec.ts` and `frontend/src/ui/layout-rules.test.ts`.
- `docs/a11y-passes.md`: the screens, the automated results and the manual passes that belong to Epic 24.

## Changed

- None to the specs. The gallery's swatches and theme toggle now wrap at 320px and 200% text. Button labels wrap anywhere instead of overflowing.

## Fixed

- Deferred #125 (shell nav under text zoom, short viewports; the `viewport-fit` part came with Story 2.8) and #116 (the gallery focus test pressed Tab before the lazy gallery rendered).
- Problems found in review (see the triage log in the story spec).
- Found by the new CI job on its first run, not on a Mac: on the Linux runner, a long unbroken word (the gallery's display type sample at 200% text) widened the page by 2px. Long words now wrap in the gallery and in the shell content (`overflow-wrap: anywhere`), and the reflow test names any element that sticks out. Checked locally with four wide fonts.

## Removed or deprecated

- None.

## Security

PASS, no new findings, no new dependency. The new CI job pins its actions to commit SHAs. See [the security report](../security-reports/story-2-7-responsive-reflow-and-accessibility-test-harness.md).

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | None | reviewed, no change |
| Development | `npm run test:e2e` now includes the accessibility and reflow specs | Continuous integration (updated: five jobs, the new job and artifact) |
| Release | None | reviewed, no change |
| Deployment | None | reviewed, no change |

## After you pull

Add "Frontend: accessibility" as a required check under Settings, Branches (a repository setting, not code).

## Tests

- New Playwright specs (`a11y-reflow.spec.ts`, 38 tests): axe on seven shell screens and the gallery at 360, 768 and 1280px in light and dark; reflow of every screen, the gallery, the install offer, the sheet and the dialog at 320px and 200% text; the 400px and 130% footer rule with boundaries; the 500px height boundary; scroll padding at 100% and 200%; text spacing; colour-alone checks. New Vitest `layout-rules.test.ts`.
- Non-regression: `npm test` (301 passed), `npm run test:e2e` (86 passed, 1 skipped for the API sample that needs `API_URL`; three consecutive runs), lint, typecheck, build.

## Deferred and known issues

- [#134](https://github.com/yebbah/little-steps/issues/134): run the accessibility checks on the built bundle and in WebKit and Firefox nightly (Epic 2 action item T1 stays open for the maintainer).
- Still open from earlier stories: [#124](https://github.com/yebbah/little-steps/issues/124), [#127](https://github.com/yebbah/little-steps/issues/127), [#129](https://github.com/yebbah/little-steps/issues/129), [#130](https://github.com/yebbah/little-steps/issues/130), [#132](https://github.com/yebbah/little-steps/issues/132).
