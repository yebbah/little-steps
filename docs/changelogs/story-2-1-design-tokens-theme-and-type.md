# Changelog: Story 2.1, Design tokens, theme and type

| | |
|---|---|
| Story | 2.1, issue #35 |
| Epic | 2, App shell and design foundations |
| Branch | story/2-1 |
| Commits | 3b727d7, c606a6b, and the docs commit that follows |
| Date | 2026-11-06 |
| Security report | [story-2-1-design-tokens-theme-and-type.md](../security-reports/story-2-1-design-tokens-theme-and-type.md) |

## Summary

The frontend gets its Playroom visual foundation: every DESIGN.md colour, type, spacing and radius token as CSS custom properties, light and dark modes that follow the device or a stored choice applied before first paint, and a dev-only component gallery at `/dev/gallery`. Stylelint keeps the design flat and the focus outline in place.

## Added

- `frontend/src/styles/tokens.css` (all colours with `-dark` twins, type, spacing, radii, a `--color-*` layer that follows the mode), `base.css` (100% root, iOS-only `-apple-system-body`, `.type-*` classes, focus ring) and `theme.ts` (Light / Dark / System storage; Settings uses it in Story 2.9).
- An inline script in `index.html` that applies the stored Light or Dark before first paint.
- The gallery at `/dev/gallery`, registered only when `VITE_ENABLE_GALLERY=true` (`.env.development`, `.env.test`).
- Stylelint with rules for `box-shadow` and `outline`, `npm run lint:test` extended with 19 rule cases, and a CI step for it.
- Tests: token values against DESIGN.md, semantic layer, type scale, contrast of every pairing (R-02) and scrimmed sheet edges, production and staging bundles without the gallery (R-01), theme module and inline script, gallery component, and Playwright checks for first paint, device scheme, body size, focus ring and axe on the gallery at 360, 768 and 1280px in both modes.

## Changed

- `npm run lint` now runs stylelint after oxlint.
- `vite.config.ts` forces the gallery flag off in every mode except development and test.
- The two red-phase tests for R-01 and R-02 are un-skipped; the R-02 pairing list is extended.

## Fixed

- None (review findings fixed before the story closed are in the spec's triage log).

## Removed or deprecated

- None.

## Security

PASS, no blocking findings, no new warnings from this story. See the [security report](../security-reports/story-2-1-design-tokens-theme-and-type.md).

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | No change (`npm ci` installs stylelint) | Setup |
| Development | `lint` includes stylelint; `lint:test` runs both rule suites; new paragraph on tokens, theme and the gallery flag | Development |
| Release | Reviewed, no change (production build excludes the gallery) | Release |
| Deployment | Reviewed, no change | Deployment |

Also updated: Continuous integration table (lint rule tests step), `frontend/README.md` (stylelint, commands). Layout and Versions reviewed, no change.

## After you pull

`cd frontend && npm ci`.

## Tests

- Vitest: 35 passed (33 added or un-skipped across tokens, contrast, theme, gallery, bundle).
- Playwright (Chromium): 17 passed, 3 skipped (Stories 2.3 and 2.5 red-phase, API sample without backend).
- `npm run lint:test`: 25 cases passed (19 stylelint).
- Non-regression: `npm run lint`, `npm run typecheck`, `npm run build` pass.

## Deferred and known issues

- #111: image-layer focus ring contrast and DESIGN.md ratio cross-check (Epic 18).
- #112: root-font and 17px body check in WebKit (Story 2.7).
