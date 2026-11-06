---
title: 'Story 2.4: Core controls'
type: 'feature'
created: '2026-11-06'
status: 'in-review'
baseline_commit: '2e0e2fd3c4ad1e5cceff16790de5d6789bd7ec57'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.specs/planning-artifacts/epics/epic-02-app-shell.md'
  - '{project-root}/.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/DESIGN.md'
  - '{project-root}/.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent, do not modify unless human renegotiates">

## Intent

**Problem:** Forms have no shared controls, so every screen would re-invent buttons, fields, chips and steppers, and the accessibility floor (focus ring, 48px targets, aria-disabled, no colour-only state) would drift.

**Approach:** A controls library in `frontend/src/ui/` (`Button`, `TextField`, `ChoiceChips`, `Stepper`, `DisclosureRow`) built only on tokens, registered in the gallery in every state, with component tests for keyboard, ARIA and stepper edges. The gallery gains fixed-width frames at 360, 768 and 1280px. Source: GitHub issue #38, Story 2.4 (UX-DR14, 16 to 21, 110).

## Boundaries & Constraints

**Always:** values from tokens (`--color-*`, `--space-*`, `--radius-*`, type classes), never literals. Visible text comes from the message catalog or from props the caller supplies from the catalog; gallery sample text lives in `gallery/strings.ts`. A control's focus ring is the shared `:focus-visible` outline (real outline, survives forced-colors). Disabled means `aria-disabled="true"`, same shape, `ink-disabled` label, still focusable, press does nothing. Selection is never colour alone (check glyph, weight 800). No shadows. Controls stay inside the DESIGN.md radii (full for buttons and chips, md for field and stepper, lg for disclosure row).

**Never:** no surfaces (Card, Sheet, StatusLine: Story 2.5), no shell, router or `useStatus` (2.3), no domain tints or icon set (2.2; the check, minus, plus and chevron glyphs are inline text or CSS in `ui/`), no catalog entries beyond the stepper messages this story needs, no live region in the stepper, no long-press, swipe or drag, no native `disabled` on a focusable control, no new dependency.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Stepper at minimum | value 0, press "−" | stays 0, "−" `aria-disabled`, keeps focus, input reads "0, minimum" (`aria-valuetext`) | no message |
| Stepper typed input | "abc", "-3", "" | non-digits dropped, negative clamps to 0, empty is empty (no value) | none |
| Paired: Succeeded over Tried | Tried 5, Succeeded set to 7 | inline "Can't be more than 5 tried" linked by `aria-describedby`; value is not committed above Tried | message clears when valid |
| Paired: Tried lowered below Succeeded | Succeeded 4, Tried to 3 | same inline error on Succeeded; "+" on Succeeded `aria-disabled` at Tried | as above |
| Single select chips | arrow keys | selection moves with focus (native radios), one selected | none |
| Multi select chips | Space | toggles that chip only | none |
| Disabled Button | click, Enter, Space | `onClick` not called, focus retained | none |
| TextField error | `error` prop | glyph plus ink text under the field, `aria-describedby` and `aria-invalid` set | none |
| Disclosure row | click | `aria-expanded` toggles, `aria-controls` names the panel id | none |

</frozen-after-approval>

## Code Map

- `frontend/src/styles/tokens.css`, `base.css` -- tokens (`--space-button-height`, `--space-target-min`, `--color-selected`, `--color-ink-disabled`, danger, radii) and the global `:focus-visible` rule. Reuse; do not edit tokens.
- `frontend/src/gallery/Gallery.tsx`, `Gallery.module.css`, `strings.ts`, `Gallery.test.tsx` -- sections are `<section aria-labelledby>`; text via `g()`. Add a controls section and frames. Parallel stories 2.2 and 2.5 also add sections: append, do not reorder existing ones.
- `frontend/src/i18n/messages.ts`, `messages.test.ts`, `tone.ts` -- catalog (`t()`); every new string must pass the tone check. Parallel stories 2.10 and 2.11 add keys: add ours as one block at the end under a `stepper.` prefix.
- `frontend/.oxlintrc.json` -- `react/jsx-no-literals` is an error: no text literals in JSX; glyphs go in CSS `content` or `{'✓'}` constants.
- `frontend/.stylelintrc.json`, `scripts/stylelint-rules.test.sh` -- shadow and outline rules apply to the new CSS modules.
- `frontend/src/test/setup.ts`, `frontend/e2e/tests/tokens-theme.spec.ts`, `frontend/e2e/support` -- patterns for component and Playwright tests.
- `frontend/src/ui/` -- new: `Button.tsx`, `TextField.tsx`, `ChoiceChips.tsx`, `Stepper.tsx`, `DisclosureRow.tsx`, one CSS module each, tests beside them, `index.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `frontend/src/ui/Button.tsx` (+css, test) -- primary, secondary, quiet, danger; 52px (quiet 48px) pills in label type; `aria-disabled` pattern -- UX-DR16, 17
- [x] `frontend/src/ui/TextField.tsx` (+css, test) -- `<label for>`, error with glyph via `aria-describedby`, plain text input accepting dictation (no `autocomplete`/`inputmode` that blocks it) -- UX-DR18
- [x] `frontend/src/ui/ChoiceChips.tsx` (+css, test) -- fieldset/legend; radios (single, arrows) or checkboxes (multi); selected wash, action border, check glyph, weight 800 -- UX-DR19
- [x] `frontend/src/ui/Stepper.tsx` (+css, test) -- single and paired modes, clamp, "0, minimum", Succeeded <= Tried, no live region -- UX-DR20
- [x] `frontend/src/ui/DisclosureRow.tsx` (+css, test) -- `<button aria-expanded aria-controls>`, dashed or solid edge -- UX-DR21
- [x] `frontend/src/i18n/messages.ts` -- `stepper.minimum`, `stepper.exceedsTried` ("Can't be more than {n} tried"), plus min/max wording only if tone check passes -- catalog rule
- [x] `frontend/src/gallery/` -- controls section in rest, focus, selected, disabled, error and reduced-motion states; frames at 360, 768, 1280px (`data-testid="frame-360"` etc.); extend `Gallery.test.tsx`
- [x] `frontend/e2e/tests/controls.spec.ts` -- focus ring (also `forced-colors`), 48px targets, axe on the gallery controls -- R-17
- [x] `README.md`, `frontend/README.md`, changelog, security report -- per CONTRIBUTING; README review recorded in the changelog

**Acceptance Criteria:**
- Given the gallery, when it renders, then every control appears in each state its spec names, inside 360, 768 and 1280px frames.
- Given any control, when focused by keyboard, then a 2px ring with 2px offset shows, also under `forced-colors: active`.
- Given the stepper at 0, when "−" is pressed, then the value stays 0, focus stays on "−" and "0, minimum" is exposed.
- Given paired mode with Tried 5, when Succeeded exceeds 5, then "Can't be more than 5 tried" shows inline and no live region exists.
- Given every control, when measured, then its tap target is at least 48px (buttons 52px) and none relies on long-press, swipe or drag.

## Implementation Notes

## Spec Change Log

## Review Triage Log

Reviewers: BH blind, EC edge, VG verification gap (three separate subagents; VG found no gap).

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Typed `2.5` or `1e3` has its non-digits stripped to 25 or 13 [BH, EC] | medium | patch, fixed | `parseEntry` in `Stepper.tsx` now truncates the number; test "a decimal entry is truncated" |
| 2 | A held over-limit entry (7 with max 5) is announced "7, maximum" [EC] | low | patch, fixed | `!over` guard in `Stepper.tsx`; test "a held over-limit entry is not announced as maximum" |
| 3 | "+" from an empty field with min above 1 skips the minimum [EC] | low | patch, fixed | `Math.max(min, 1)` in `Stepper.tsx`; "+" from empty covered by "from an empty field" test |
| 4 | Caller changes `value` while a draft is held, so the stale draft shows [BH, EC, VG] | low | rejected | No caller resets a stepper; a guard would add an effect for a case nobody can reach yet |
| 5 | Commit effect depends on `onChange` identity [BH, EC] | low | rejected | Guarded by `draft`, no double commit; test "raising Tried commits the held entry" |
| 6 | Succeeded above Tried can sit in the committed pair after Tried is lowered [EC] | medium | rejected | The matrix row requires exactly this: the error shows and the value is not auto-changed; the form validates on save (screens in later epics) |
| 7 | Disabled Button lets a parent onClick or onKeyDown handlers run [BH, EC] | low | rejected | Spec: "onClick not called"; no surface or row wraps a Button yet (Card is not a tap target) |
| 8 | TextField: caller `aria-invalid`, empty-string error, `type` override [EC] | low | rejected | `type` must stay overridable (email field); an empty error is not a state the spec names |
| 9 | ChoiceChips with empty or duplicate options, or no selection [EC] | low | rejected | Native radio behaviour; callers pass catalog lists |
| 10 | `FRAME_WIDTHS` duplicated in gallery and e2e helper [BH, EC, VG] | low | rejected | `controls.spec.ts` "the gallery has the 360, 768 and 1280px frames" fails if they drift |
| 11 | Selected chip in forced-colors depends on colour [BH] | false | rejected | Selection also shows the check glyph and weight 800 (DESIGN.md choice-chip); the spec forbids colour-only state and this satisfies it |
| 12 | Literals `4.5rem`, `8rem`, `150ms` in CSS [EC claim] | low | rejected | No token exists for them; colours, spacing, radii and type all come from tokens |
| 13 | No `aria-valuemax`, no region role on the disclosure panel, no RTL chevron, no controlled mode [BH] | low | rejected | Not required by DESIGN.md or EXPERIENCE.md; added when a screen needs them |
| 14 | Errors are not announced [BH] | false | rejected | Intended: spec and EXPERIENCE.md say no live region in the stepper; errors are linked by `aria-describedby` |
| 15 | Story 2.1 gallery focus test presses Tab before the lazy gallery renders; failed once in four full runs [run observation] | low | defer, issue to be created before the push (needs the user's go-ahead for a remote action) | `frontend/e2e/tests/tokens-theme.spec.ts` line 86 to 93; pre-existing, not changed by this story |
| 16 | `e2e` locator `control.locator('+ span')` may not resolve [BH, EC] | false | rejected | The spec ran and passed it for radio and checkbox chips under both forced-colors modes |

## Design Notes

- Disabled control: `<button aria-disabled="true">` with a click handler that returns early; styling by `[aria-disabled='true']`, not `:disabled`.
- Stepper input is `<input type="number" inputmode="numeric">` with `aria-valuetext="0, minimum"` at 0; "−"/"+" are named from the field label via caller-supplied labels ("Fewer minutes"). Caller labels come from the catalog.
- No spec change needed: the code follows the Story 2.4 acceptance criteria, DESIGN.md and EXPERIENCE.md. Message catalog and gallery text are within the story's scope.

## Verification

**Commands:**
- `cd frontend && npm run lint && npm run typecheck && npm test` -- expected: green
- `cd frontend && npm run lint:test && npm run test:e2e` -- expected: green, including `controls.spec.ts`
- `deploy/security-scan.sh` -- expected: no KEV, no CVSS 7+ (twice per story, per CONTRIBUTING)
