# Changelog: Story 2.5, Surfaces, feedback and labels

| | |
|---|---|
| Story | 2.5, issue #39 |
| Epic | 2, App shell and design foundations |
| Branch | feature/epic-02-issue-39-surfaces-feedback-and-labels |
| Commits | `99d31ab` (squash-merged) |
| Date | 2026-11-07 |
| Security report | [story-2-5-surfaces-feedback-and-labels.md](../security-reports/story-2-5-surfaces-feedback-and-labels.md) |

## Summary

The frontend gets its shared surfaces, feedback and label components, so later screens use one card, sheet, status line, banner and source label instead of inventing their own. Sheets and dialogs follow the modal focus rules (R-04) and the status line follows the clearing rules, in one place.

## Added

- `frontend/src/surfaces/`: `Card`, `BlockCard`, `HeroBand`, `TipBlock`; `Sheet` and `Dialog` on Radix Dialog (focus to the heading, trapped, returned to the invoker, page behind inert, one level, closes on Esc, scrim, swipe down or Close); `StatusLine` with its provider and the `useUndo` helper; `Banner` and the `Notices` region (newest first); `SourceBadge`, `AiLabel`, `CheckTag`.
- The shell mounts the status-line provider, and each placeholder screen shows the line under its heading.
- Catalog keys `surface.close`, `surface.sourceCareTeam`, `surface.sourceProposed` and `surface.aiSuggested`.
- Gallery section "Surfaces, feedback and labels" with a working sheet and dialog.
- Dependency `@radix-ui/react-dialog` 1.3.1 (exact version).

## Changed

- None. The code follows the Story 2.5 acceptance criteria, DESIGN.md and EXPERIENCE.md, so there was no spec change.
- The red-phase test AC-4 in `e2e/tests/dialog.spec.ts` is un-skipped (Epic 2 action item T2).

## Fixed

- Problems found in review (see the triage log in the story spec): a sheet handing off to a dialog, focus lost after Undo or Dismiss, an Undo that showed its own line, a sheet body shrinking at high zoom and others.

## Removed or deprecated

- None.

## Security

PASS, no KEV or CVSS 7.0 findings from this story; one new dependency family (Radix). See [the security report](../security-reports/story-2-5-surfaces-feedback-and-labels.md).

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | `npm ci` in `frontend/` installs the new dependency; no other change | Setup (reviewed, no change) |
| Development | New components in `frontend/src/surfaces/` | Layout (updated: one paragraph in the README, one line in `frontend/README.md`) |
| Release | No change | reviewed, no change |
| Deployment | No change | reviewed, no change |

## After you pull

Run `cd frontend && npm ci`.

## Tests

- New component tests (Vitest): surfaces and labels, modal, status line, banners, gallery. Positive: focus, Esc, scrim, swipe, inert, hand-off, Undo, banner order. Negative: refused second modal, no timer clearing, Tab and modifier keys do not clear, empty text ignored.
- New Playwright tests in `e2e/tests/dialog.spec.ts`: focus and Esc (AC-4), trap and inert page, Close and scrim, phone and tablet sizing, reduced motion, axe in light and dark.
- Non-regression: `npm test` (246 passed), `npm run test:e2e` (40 passed, 1 skipped), lint, typecheck, build.
- Commands: `cd frontend && npm test && npm run test:e2e`.

## Deferred and known issues

- [#127](https://github.com/yebbah/little-steps/issues/127): status line clearing when a programmatic navigation follows or precedes a shown line.
