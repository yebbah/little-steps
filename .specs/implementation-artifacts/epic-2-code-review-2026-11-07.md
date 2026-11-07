# Epic 2 code review

Date: 2026-11-07. Scope: the frontend, CI and accessibility changes of Epic 2 (Stories 2.1 to 2.11), `c1868da^..main` (8,736 lines), split into four groups. Layers: blind hunter, edge case hunter, verification gap reviewer and acceptance auditor, each run per group (16 reviews, 15 reported findings; the verification gap review of group B found no gap).

| Group | Files |
|---|---|
| A | tokens, theme, domain tints, icons, message catalog, `index.html` |
| B | core controls and the gallery |
| C | app shell, Settings, surfaces |
| D | PWA, install offer, accessibility harness, CI, build tests |

## Result

About 150 raw findings. After deduplication and checking each against the code: **fixed 31**, **deferred 4 new issues plus 6 already open**, **rejected or false positive the rest**, **1 spec conflict for the human**. The fixes are in the branch `chore/epic-02-code-review-fixes`; 331 unit tests, 89 Playwright tests, lint, typecheck and build pass.

## Fixed

| # | Finding | Layers | Where |
|---|---------|--------|-------|
| 1 | The browser bar colour was not set on page load (only on a Settings change); the inline script now sets it, and a test and an e2e check cover it | VG A, EC A | `index.html`, `main.tsx` |
| 2 | Fullscreen and minimal-ui (F11 in a plain tab) were remembered as "installed" for good | BH D, EC D | `pwa/install.ts` |
| 3 | The installed flag was never cleared, so after an uninstall the Settings row stayed dead; the browser offering install now clears it | AA D, EC D, BH D | `pwa/install.ts` |
| 4 | The Settings row said "already on your home screen" for any reason the offer did not open; it now says install is unavailable when that is the reason | AA C, EC C | `SettingsScreen.tsx` |
| 5 | Nothing tested that `main.tsx` registers the worker or that `register.ts` reports a waiting version; a unit test and a built-bundle check now do | VG D | `register.test.ts`, `pwa-build.test.ts` |
| 6 | The PWA build test failed on any asset whose name contains "api"; it now matches path segments and removes its temp folder | BH D, EC D | `pwa-build.test.ts` |
| 7 | Banner dismiss moved focus to main but no test saw it; also skipped when a modal is open | VG C, EC C | `Banner.tsx` |
| 8 | A sheet opened with nothing focused could return focus to an earlier, stale invoker | BH C, EC C | `Modal.tsx` |
| 9 | Arrow keys, Home, End and Page keys (screen-reader navigation) cleared the status line | BH C | `StatusLineProvider.tsx` |
| 10 | An unknown sub-path such as `/goals/x` marked Goals as the current destination | EC C | `NavItems.tsx` |
| 11 | `Object.hasOwn` is missing in Safari before 15.4, so the catalog lookup could throw | EC A | `messages.ts` |
| 12 | A Domain tag with no name rendered an empty colour-only pill | EC A | `DomainTag.tsx` |
| 13 | A held over-limit Stepper entry survived the caller resetting the value; "+" on an empty field with a ceiling of 0 created an over-limit entry; an absurd typed number reached the caller | BH B, EC B | `Stepper.tsx` |
| 14 | A disabled `Button` let the press reach an ancestor, and dropped a caller's `aria-disabled` | BH B, EC B | `Button.tsx` |
| 15 | `TextField` dropped a caller's `aria-invalid`; multi-select chips threw on a missing value | BH B, EC B | `TextField.tsx`, `ChoiceChips.tsx` |
| 16 | The dismiss label could cut a two-unit character in half; an empty `SourceBadge` label rendered no text | EC C | `firstWords.ts`, `Labels.tsx` |
| 17 | `/dev/gallery/` with a trailing slash was not matched | EC D | `main.tsx` |
| 18 | The gallery's visit-only theme choice leaked after leaving it; gallery tests leaked `localStorage`; the surfaces section skipped a heading level | BH B, EC B, AA B | `Gallery.tsx`, `Surfaces.tsx`, `Gallery.test.tsx` |
| 19 | The stylelint rule test wrote its fixture inside `src/`, where a parallel lint run could see it | BH D, EC D | `stylelint-rules.test.sh` |
| 20 | Contrast pairings for `ink-soft` on selected and pressed were missing; the luminance threshold used the superseded constant | EC A | `tokens.contrast.test.ts` |
| 21 | No unit tests for `ActionRow` (the 400px and 130% rule), `usePinnedBottom` and the registration; Story 2.3's "Back restores scroll" had no test | BH C, AA C, VG D | new tests, `route-change.spec.ts` |
| 22 | `e2e/README.md` was stale (future tense, a nightly run that does not exist) and described personal tooling outside the repository | BH D | `e2e/README.md` |

## Deferred (issues)

| Issue | What |
|---|---|
| [#136](https://github.com/yebbah/little-steps/issues/136) | Gallery shows every state of every control, with surfaces inside the frames |
| [#137](https://github.com/yebbah/little-steps/issues/137) | Plural-aware catalog strings |
| [#138](https://github.com/yebbah/little-steps/issues/138) | Catalog coverage tests read the spines |
| [#139](https://github.com/yebbah/little-steps/issues/139) | Axe incomplete results for contrast over the scrim |
| Already open | [#127](https://github.com/yebbah/little-steps/issues/127) status line and programmatic navigation, [#129](https://github.com/yebbah/little-steps/issues/129) shell fallback and cache headers, [#130](https://github.com/yebbah/little-steps/issues/130) update on resume, [#132](https://github.com/yebbah/little-steps/issues/132) theme in another tab, [#134](https://github.com/yebbah/little-steps/issues/134) built bundle and WebKit/Firefox nightly, [#110](https://github.com/yebbah/little-steps/issues/110) tone coverage |

## Needs a decision from the human (spec conflict)

Story 2.2 says "white tiles at 76px, 56px and 36px", while DESIGN.md says the 36px plan-row square is tinted with the Domain colour, and the code follows DESIGN.md. Under the spec-first policy this is surfaced, not resolved in code: update the Story 2.2 acceptance text (or DESIGN.md) so they agree.

## Rejected or false positive (grouped)

- **"Missing from the diff"** (stylelint rule, gallery route and its build test, icon files, UI review checklist, README and changelog): they exist elsewhere in the epic; each group saw only its own slice.
- **Spec-mandated behaviour:** no live region in the Stepper (Story 2.4), banners announce through the one shell region (UX-DR116), a pair may hold Succeeded above Tried with an inline error (Story 2.4 triage), Back to Family is a push, "Not now" is final.
- **Intentional:** the gallery strings stay out of the catalog to keep them out of the production bundle; theme colours in the manifest are one light value; a dismissed browser prompt counts as "Not now"; the root font size models 200% text (documented in `docs/a11y-passes.md`).
- **Not reachable yet or by design:** more than two `ActionRow` children, duplicate banner ids, a second modal opening in the same commit, blocked-storage visit counting (a feature offer waits), the `rail` at 600px and under 500px tall (scrolls by keyboard), single-select that cannot be cleared.
- **Style and tidiness:** raw pixel values matching DESIGN.md, bare focus-key strings, import style, duplicated screen header markup, test helpers that read CSS text (the Playwright specs check the computed values).
