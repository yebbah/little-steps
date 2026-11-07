---
title: 'Story 2.5: Surfaces, feedback and labels'
type: 'feature'
created: '2026-11-07'
status: 'in-review'
baseline_commit: 'd08dbda72e5773c28e73c4764a05e5663cd442f3'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.specs/planning-artifacts/epics/epic-02-app-shell.md'
  - '{project-root}/.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/DESIGN.md'
  - '{project-root}/.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent, do not modify unless human renegotiates">

## Intent

**Problem:** Screens have no shared surfaces or feedback components, so every feature would invent its own cards, sheets, status messages, notices and source labels, and the modal focus rules (R-04) and the status-line clearing rules would drift.

**Approach:** A surfaces library in `frontend/src/surfaces/` (`Card`, `BlockCard`, `HeroBand`, `TipBlock`, `Sheet`, `Dialog` on Radix, `StatusLine` with its provider, `Banner` with the `Notices` region, `SourceBadge`, `AiLabel`, `CheckTag`, and the `useUndo` helper), built on tokens and catalog copy, registered in the gallery, with component tests and the AC-4 Playwright test un-skipped. Source: GitHub issue #39, Story 2.5 (UX-DR22 to 26, 28, 29, 111, 113, 122).

## Boundaries & Constraints

**Always:** values from tokens, text from the catalog (gallery sample text in `gallery/strings.ts`). No shadows. Cards flat with 1px edges and their radii (Card xl, BlockCard lg, HeroBand xl, TipBlock lg, StatusLine and Banner md, badges full, CheckTag sm). Modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`; focus to the heading on open, trapped, returned to the invoker on close; the page behind is inert; one modal level only. The status line is announced only through the shell status region (`useStatus().announce`); it never carries a live region of its own and never clears on a timer. Every badge and label carries text.

**Never:** no new screens or routes, no feature components (Story 2.9 and later), no timers for dismissal, no state shown by colour alone, no dependency except `@radix-ui/react-dialog` (exact version).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Open a sheet | click invoker | dialog named by its heading, heading focused, Tab stays inside, page behind inert | n/a |
| Close a sheet | Esc, scrim tap, swipe down, Close | closes, focus returns to the invoker | n/a |
| Second modal | open while another is open | refused: `onOpenChange(false)`, only one dialog exists | n/a |
| Status line shown | `show(text)` | visible line under the h1, announced once in the shell region | empty text ignored |
| Status line, action navigates | `show` then navigate | line survives that navigation | n/a |
| Status line cleared | next click, key press or back navigation outside the line | line removed, never on a timer | n/a |
| Undo | click the quiet Undo | calls the handler once, clears the line | n/a |
| Banners | three added | newest first inside the "Notices" region, none blocks the screen | n/a |
| Dismiss | banner with `onDismiss` | button "Dismiss notice: <first words>" | n/a |
| Reduced motion | `prefers-reduced-motion: reduce` | sheet appears with no slide or fade | n/a |

</frozen-after-approval>

## Code Map

- `frontend/src/surfaces/` -- new: one component and CSS module each, tests beside them, `index.ts`.
- `frontend/src/shell/AppShell.tsx` -- wraps the shell in the status-line provider.
- `frontend/src/i18n/messages.ts` -- adds a `surface.` block (Close, badge labels, AI label).
- `frontend/src/gallery/` -- a surfaces section appended after the controls.
- `frontend/e2e/tests/dialog.spec.ts` -- AC-4 un-skipped (action item T2).

## Tasks & Acceptance

**Execution:**
- [x] Surfaces: Card, BlockCard, HeroBand, TipBlock -- UX-DR29
- [x] Sheet and Dialog on Radix -- UX-DR28, 113
- [x] StatusLine, provider and Undo helper -- UX-DR25, 111
- [x] Banner and Notices -- UX-DR26
- [x] SourceBadge, AiLabel, CheckTag -- UX-DR22 to 24
- [x] Reduced motion -- UX-DR122
- [x] Gallery section, component tests, e2e AC-4 and axe, docs, changelog, security report

**Acceptance Criteria:** the Story 2.5 acceptance criteria in the epic file, unchanged.

## Spec Change Log

## Review Triage Log

Reviewers: BH blind, EC edge, VG verification gap (three separate subagents).

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Sheet handing off to a Dialog in one action leaves the page inert with no modal [BH, EC] | high | patch, fixed | `modalLevel.ts` owner is now an external store; test "a sheet can hand off to a dialog in one action" |
| 2 | A refused modal could pop up later if its caller ignored the close [BH] | medium | patch, fixed | test "a refused modal stays closed after the first one closes" |
| 3 | Undo or Dismiss removes the focused button and focus falls to the body [BH] | medium | patch, fixed | `focusMain.ts`; tests "after Undo removes its button, focus moves to the main landmark" |
| 4 | Undo clears a line its own handler shows [EC] | medium | patch, fixed | `StatusLine.tsx` clears first; test "an Undo that shows its own line keeps that line" |
| 5 | Invoker removed while the modal is open: focus lost [BH, EC] | low | patch, fixed | Modal falls back to main; test "if the invoker is gone ..." |
| 6 | Dismiss label unbounded for text with no spaces [EC] | low | patch, fixed | `firstWords` caps at 40 characters; test in `Banner.test.tsx` |
| 7 | Sheet body can shrink to nothing at high text zoom [EC] | medium | patch, fixed | `.body` min-height 6rem and the sheet scrolls as a whole (`Modal.module.css`) |
| 8 | Long Undo or banner action labels overflow narrow screens [EC] | low | patch, fixed | actions may shrink and wrap (`Banner.module.css`, `StatusLine.module.css`) |
| 9 | Keys such as AltGraph, NumLock or Dead cleared the line [BH] | low | patch, fixed | `NON_ACTION_KEYS` extended |
| 10 | Vacuous tests (`Button` is a function, body not inert, "at most one action") [BH, VG] | low | patch, fixed | replaced in `Modal.test.tsx`, `Banner.test.tsx` |
| 11 | No test for popstate, Dialog and swipe focus return, or reduced motion on pressed states [VG] | medium | patch, fixed | `StatusLine.test.tsx`, `Modal.test.tsx`, `Surfaces.test.tsx` |
| 12 | A programmatic navigation after a non-navigating action is taken as the action's own; popstate clears a line whose action called `navigate(-1)`; StrictMode mount case [BH, EC, VG] | medium | defer #127 | no screen can reach it yet; the issue lists the three cases to test |
| 13 | Two modals mounting open in the same commit both render for one frame [EC] | low | rejected | modals open on a user action, one at a time; the slot refuses the second as soon as its effect runs |
| 14 | Announcement may be dropped while the page is inert [BH, EC] | low | rejected | the shell region speaks on the next frame, after the modal's close commit has released `inert` |
| 15 | Banners are not a live region [BH] | low | rejected | UX-DR116: announcing goes only through the shell status region; the caller announces |
| 16 | Duplicate banner dismiss labels for notices with the same first words; duplicate ids [BH, EC] | low | rejected | the spec fixes the label as "Dismiss notice: <first words>"; ids come from the caller |
| 17 | Tests read CSS or source text [BH] | low | rejected | jsdom does not apply CSS modules; the Playwright specs check the real computed values |

## Design Notes

- No spec change is needed: the code follows the Story 2.5 acceptance criteria, DESIGN.md and EXPERIENCE.md.

## Verification

**Commands:**
- `cd frontend && npm run lint && npm run typecheck && npm test` -- expected: green
- `cd frontend && npm run lint:test && npm run test:e2e` -- expected: green, including `dialog.spec.ts`
- `deploy/security-scan.sh` -- expected: no KEV, no CVSS 7+ (twice per story)
