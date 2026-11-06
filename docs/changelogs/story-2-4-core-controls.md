# Changelog: Story 2.4, Core controls

| | |
|---|---|
| Story | 2.4, issue #38 |
| Epic | 2, App shell and design foundations |
| Branch | story/2-4 |
| Commits | see `git log story/2-4` (one feature commit) |
| Date | 2026-11-06 |
| Security report | [story-2-4-core-controls.md](../security-reports/story-2-4-core-controls.md) |

## Summary

The frontend gets its shared form controls, so later screens do not each re-invent buttons, fields, chips and steppers, and the accessibility floor (focus ring, 48px targets, `aria-disabled`, no colour-only state) stays in one place. The gallery shows them in every state at 360, 768 and 1280px.

## Added

- `frontend/src/ui/`: `Button` (primary, secondary, quiet, danger), `TextField` (label, error with glyph), `ChoiceChips` (single via radios, multi via checkboxes, check glyph and weight 800 when selected), `Stepper` and `PairedStepper` (clamp at 0, "0, minimum", Succeeded never above Tried, no live region) and `DisclosureRow` (dashed or solid edge).
- Catalog keys `stepper.minimum`, `stepper.maximum` and `stepper.exceedsTried` (one block at the end of `messages.ts`).
- Gallery "Core controls" section with the three fixed-width frames (`frame-360`, `frame-768`, `frame-1280`).
- Tests: 5 component test files and an extended gallery test (Vitest), and `e2e/tests/controls.spec.ts` (Playwright: focus ring also under `forced-colors`, tap targets, axe in light and dark, stepper at 0, no live region, reduced motion).

## Changed

- None. The code follows the Story 2.4 acceptance criteria, DESIGN.md and EXPERIENCE.md, so there was no spec change.

## Fixed

- Review findings fixed before the story closed: a typed decimal such as `2.5` was read as 25; a held over-limit entry was announced as "maximum"; "+" from an empty field with a minimum above 1. See the spec's Review Triage Log.

## Removed or deprecated

- None.

## Security

PASS, no blocking findings, no new warnings from this story, no new dependency. See the [security report](../security-reports/story-2-4-core-controls.md).

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | Reviewed, no change | Setup |
| Development | New paragraph on the core controls and where they live; `frontend/README.md` gets a source layout section | Development |
| Release | Reviewed, no change (the gallery is still excluded from production) | Release |
| Deployment | Reviewed, no change | Deployment |

Also reviewed, no change: Prerequisites, Layout (`frontend/` entry still accurate), Versions.

## After you pull

`cd frontend && npm ci`.

## Tests

- Vitest: 83 tests passed across 13 files (23 new in `src/ui`, 1 added to the gallery test; the matrix rows are covered by `Stepper.test.tsx`, `Button.test.tsx`, `ChoiceChips.test.tsx`, `TextField.test.tsx` and `DisclosureRow.test.tsx`).
- Playwright (Chromium): 26 passed, 3 skipped (red-phase tests of later stories and the API sample without a backend).
- `npm run lint` (no warnings), `npm run typecheck`, `npm run lint:test` pass.

## Deferred and known issues

- The Story 2.1 test "the focus ring is a real outline" presses Tab straight after `goto`, before the lazily loaded gallery has rendered, and failed once in about four full runs. Logged as #116, target 2027-01-05 (triage log, row 15).
