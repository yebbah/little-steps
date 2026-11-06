---
title: 'Story 2.1: Design tokens, theme and type'
type: 'feature'
created: '2026-11-06'
status: 'in-review'
route: 'dispatch'
context:
  - '{project-root}/.specs/planning-artifacts/epics/epic-02-app-shell.md'
  - '{project-root}/.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/DESIGN.md'
---

<frozen-after-approval reason="human-owned intent, do not modify unless human renegotiates">

## Intent

**Problem:** The app has no visual foundation: no colour, type, spacing or radius tokens, no light or dark mode, and no place to see them.

**Approach:** `tokens.css` carries every DESIGN.md token (light value and `-dark` twin) with a semantic `--color-*` layer that follows the device or the stored Light / Dark choice, applied before first paint by an inline script. A dev-only gallery at `/dev/gallery` shows the tokens. Stylelint forbids shadows and removed outlines. Source: GitHub issue #35.

## Boundaries & Constraints

**Always:** values come from DESIGN.md and a test compares them. System font stack, no web font. Root `100%`, with `-apple-system-body` only behind the iOS guard. The gallery is excluded from every mode except development and test.

**Never:** no `box-shadow` other than `none`, no outline removed without a replacement. No router, controls or Settings screen (Stories 2.3, 2.4, 2.9).

</frozen-after-approval>

## Code Map

- `frontend/src/styles/tokens.css`, `base.css`, `theme.ts` -- tokens, root and type classes, theme storage and apply.
- `frontend/index.html` -- inline pre-paint theme script (same storage key as `theme.ts`).
- `frontend/src/gallery/` -- dev-only gallery; its text lives in `gallery/strings.ts`, not the product catalog, so it stays out of production.
- `frontend/src/main.tsx`, `vite.config.ts`, `.env.development`, `.env.test` -- the `VITE_ENABLE_GALLERY` flag.
- `frontend/.stylelintrc.json`, `scripts/stylelint-rules.test.sh` -- CSS rules and their tests.

## Tasks & Acceptance

- [x] Tokens, base styles, theme module, pre-paint script
- [x] Gallery at `/dev/gallery` with Light / Dark / System toggle (not stored; storing belongs to Settings, Story 2.9)
- [x] Flag handling and build test (R-01), contrast test (R-02) un-skipped
- [x] Stylelint rules with tests; lint step in CI
- [x] README, frontend README, changelog, security report

## Design Notes

- `--color-*` is the layer components use; raw `--name` and `--name-dark` exist for tests and the gallery.
- Vitest stubs CSS files, so `vite.config.ts` lets `tokens.css` through for the gallery's `?raw` import.
- No spec change was needed: the code follows the Story 2.1 acceptance criteria and DESIGN.md.

## Review Triage Log

Layers run: blind (BH), edge-case (EC), verification-gap (VG), as three separate reviewers.

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Outline rule bypassed by `0px`, `NONE`, `2px none`, `hidden`; `-webkit-box-shadow` not covered (EC, BH, VG) | medium | patch, fixed | `.stylelintrc.json`; 9 new cases in `stylelint-rules.test.sh` |
| 2 | Gallery included by non-production modes such as staging when the flag is set (EC, BH) | low | patch, fixed | `vite.config.ts` allows the flag only in development and test; staging build test |
| 3 | Gallery toggle ignored the applied theme and could not return to System (BH, EC) | low | patch, fixed | initial state from `readThemeChoice`, System button; `Gallery.test.tsx` |
| 4 | Semantic layer (dark blocks) not tested (VG) | medium | patch, fixed | `tokens.test.ts` "semantic layer" |
| 5 | Type scale values compared only for unit (VG) | medium | patch, fixed | `tokens.test.ts` type scale vs DESIGN.md |
| 6 | Stored Light on a dark device and invalid stored values untested (VG) | medium | patch, fixed | e2e "stays light on a dark device"; inline script unit tests |
| 7 | Scrimmed sheet edge contrast not measured (VG) | high | patch, fixed | `tokens.contrast.test.ts` sheet edge test |
| 8 | Focus colour not asserted (VG) | low | patch, fixed | e2e checks `outline-color` |
| 9 | Dynamic import of the gallery had no error handling (BH, EC) | low | patch, fixed | `main.tsx` falls back to the app |
| 10 | Image-layer focus ring contrast and DESIGN.md ratio cross-check (VG) | medium | defer #111 | arrives with Epic 18 |
| 11 | Root-font and 17px check runs in Chromium only (VG) | medium | defer #112 | WebKit in the nightly matrix, Story 2.7 |
| 12 | Duplicated dark mapping in tokens.css, inline script key duplication, `rem` scales from 17px on iOS (BH) | low | rejected | CSS cannot share the blocks without a build step; a test keeps them identical; key parity tested; iOS scaling is intended (UX-DR9) |
| 13 | Gallery regexes parse the CSS text; `filter: drop-shadow` and `text-shadow` not forbidden (BH, EC) | low | rejected | the colour and spacing tests fail on a token the gallery would miss; DESIGN.md forbids only box-shadow (UX-DR12) |
| 14 | No test that Playroom is the only theme (VG) | low | rejected | no theme mechanism exists besides the Light / Dark / System attribute |
