---
title: 'Story 2.7: Responsive reflow and accessibility test harness'
type: 'feature'
created: '2026-11-07'
status: 'in-review'
baseline_commit: '5db79516fd9f22d5029140dd8c7d0d975df6498d'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.specs/planning-artifacts/epics/epic-02-app-shell.md'
  - '{project-root}/.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/DESIGN.md'
  - '{project-root}/.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent, do not modify unless human renegotiates">

## Intent

**Problem:** Nothing proves that every screen reflows and stays operable with large text, a short viewport or a screen reader, and the reflow rules (two-button footers, unpinning on short screens, scroll padding) are not implemented.

**Approach:** Implement the reflow rules (UX-DR121) and add the Playwright and axe harness as its own CI job, "Frontend: accessibility": axe on every shell screen and the gallery frames in light and dark (UX-DR119), no horizontal scroll or truncated label at 320px and 200% text (UX-DR120), the reflow rules, no state by colour alone (UX-DR123), and `docs/a11y-passes.md`. Source: GitHub issue #41, Story 2.7. Also folds in deferred #125 (shell nav under text zoom and short viewports) and #116 (flaky gallery focus test).

## Boundaries & Constraints

**Always:** values from tokens; text from the catalog; the pinned bottom nav's real height drives the content's bottom padding and `scroll-padding-bottom`; two buttons side by side only at a container width of 400px or more and a text scale of 130% or less; the CI job is its own job with pinned action SHAs; docs link to CONTRIBUTING for policy and do not restate it.

**Never:** no manual screen-reader passes (Epic 24), no new dependency, no change to a spec or an acceptance criterion, no skipped or disabled test to get green.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Phone, default text | Dialog with two buttons at 360px | stacked, primary at the bottom | n/a |
| Wide container, 130% text | 768px | side by side | n/a |
| Wide container, 150% text | 1280px | stacked | n/a |
| Short phone | 360 by 480 | bottom nav static after the content, sheet scrolls as a whole | n/a |
| Tall phone, 200% text | 360 by 800 | `scroll-padding-bottom` equals the measured nav height | n/a |
| 320px, 200% text | every shell screen and the gallery | no horizontal scroll, no clipped label | n/a |

</frozen-after-approval>

## Code Map

- `frontend/src/shell/usePinnedBottom.ts`, `AppShell.tsx`, `AppShell.module.css`, `styles/base.css` -- measured nav height, short-viewport unpinning, scroll padding.
- `frontend/src/surfaces/ActionRow.tsx` -- the two-button rule; `Modal.tsx` uses it for Dialog actions.
- `frontend/e2e/tests/a11y-reflow.spec.ts`, `src/ui/layout-rules.test.ts` -- the harness.
- `.github/workflows/ci.yml`, `README.md`, `docs/workflow.md` -- the new job; `docs/a11y-passes.md` -- the results table.

## Tasks & Acceptance

**Execution:**
- [x] Reflow rules (ActionRow, nav height, short viewports, scroll padding)
- [x] axe over every shell screen and the gallery, light and dark
- [x] Reflow at 320px and 200% text, reflow rules, colour-alone tests
- [x] CI job "Frontend: accessibility", `docs/a11y-passes.md`
- [x] #116 flaky gallery focus test

**Acceptance Criteria:** the Story 2.7 acceptance criteria in the epic file, unchanged.

## Spec Change Log

## Review Triage Log

Reviewers: BH blind, EC edge, VG verification gap (three separate subagents).

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | The nav query (min-height 500px) and the CSS unpin (max-height 499.98px) left a gap [EC] | medium | patch, fixed | the JS query is now the complement; test "the 500px height boundary" |
| 2 | A text-size change while a dialog is open did not re-lay out its buttons [EC] | medium | patch, fixed | 1rem probe observed in `ActionRow`; test "a text-size change while a dialog is open" |
| 3 | Three buttons or long labels could overflow the row [EC] | low | patch, fixed | `flex-wrap` on the row |
| 4 | `docs/a11y-passes.md` claimed results no test backed (sheet and dialog at 320px and 200%) [VG] | high | patch, fixed | tests for the gallery sheet, dialog and install offer; the doc names the spec behind each row |
| 5 | The truncation check missed vertical clipping, inline elements and clipping ancestors, and flagged non-truncated ellipsis [BH, VG] | medium | patch, fixed | `reflowProblems` rewritten |
| 6 | No test at the 399 and 400px container boundary, or the 499 and 500px height boundary [VG] | medium | patch, fixed | two boundary tests |
| 7 | Weak or racy tests: layout read before the effect, class-name hash selector, `.first()` link, scroll before padding updated, bar only checked for existing [BH, VG] | medium | patch, fixed | `data-part`, polls, bar size and colour checks; reduced motion in the layout tests (a flaky run was traced to the slide-in) |
| 8 | The text-spacing check could select nothing [VG] | low | patch, fixed | asserts more than five elements were checked |
| 9 | The accessibility job runs Chromium on the dev server only; no WebKit or Firefox; text size is simulated [VG] | low | defer #134 | nightly matrix and built bundle |
| 10 | Rail scrolls internally at 600px wide and under 500px tall [EC] | low | rejected | the rail is a scroll container reachable by keyboard; the spec unpins only the bottom nav |
| 11 | Safe-area padding dropped from `.main`; flash of fallback padding under StrictMode; landscape insets [BH, EC] | low | rejected | the nav carries `env(safe-area-inset-bottom)` itself and its measured height includes it; no left or right inset rule is in the spec |
| 12 | `scroll-padding-bottom` only checked for the nav, not a sheet footer [VG] | low | rejected | there is no other pinned footer; a sheet footer sits inside the sheet's own scroller |
| 13 | iOS detection duplicated from `base.css` [EC] | low | rejected | CSS and JS cannot share the check; both cite each other |
| 14 | The job is not wired to a required check [VG] | low | rejected | branch protection is a repository setting; the README says to add it |

## Design Notes

- No spec change is needed. The text-scale rule needs the root font size, which CSS cannot compare with a container width, so `ActionRow` measures both (same iOS detection as `base.css`).
- Epic 2 action item T1 (browser matrix and coverage target): this story runs Chromium on pull requests as the test design proposes; the nightly WebKit and Firefox run and the coverage target remain for the maintainer to confirm.

## Verification

**Commands:**
- `cd frontend && npm run lint && npm run typecheck && npm test` -- expected: green
- `cd frontend && npm run test:e2e` -- expected: green, including `a11y-reflow.spec.ts`
- `bash deploy/check-actions.sh` -- expected: all actions pinned
- `deploy/security-scan.sh` -- expected: no KEV, no CVSS 7+ (twice per story)
