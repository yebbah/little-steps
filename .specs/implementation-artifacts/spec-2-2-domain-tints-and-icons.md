---
title: 'Story 2.2: Domain tints and icons'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: '2e0e2fd3c4ad1e5cceff16790de5d6789bd7ec57'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.specs/planning-artifacts/epics/epic-02-app-shell.md'
  - '{project-root}/.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/DESIGN.md'
---

<frozen-after-approval reason="human-owned intent, do not modify unless human renegotiates">

## Intent

**Problem:** Domain tint tokens exist (Story 2.1) but nothing maps a free-text Domain to a family, shows it with its label, or draws the object icons the shell and screens need.

**Approach:** A pure `domainTint(domainName)` function applies the DESIGN.md keyword rule; `DomainTag` shows the label on its tint; `IconTile` draws custom line-icon SVGs (2.4px stroke) in a white tile at 76, 56 and 36px. Both components are registered in the gallery. Source: GitHub issue #36.

## Boundaries & Constraints

**Always:** the keyword table and tie-break come from DESIGN.md (whole-word, case-insensitive, longest keyword wins, ties to the family higher in the table, no match gives `domain-other`). The Domain's own text is always rendered with the tint. Icons are objects only, decorative (`aria-hidden`), flat, no shadow. Tint colours come from the existing `--color-domain-*` tokens.

**Never:** no icon library, no people, faces, mascots, rings, streaks or badges. No tint for status, charts, print or decoration. No change to core controls, the message catalog or the shell (Stories 2.3, 2.4, 2.10, 2.11).

</frozen-after-approval>

## Code Map

- `frontend/src/domain/domainTint.ts` (new) -- family type, ordered keyword table, pure `domainTint`.
- `frontend/src/domain/DomainTag.tsx`, `domain.module.css` (new) -- label on tint; Domain text is data, not catalog text.
- `frontend/src/icons/` (new) -- `icons.tsx` (SVG set), `IconTile.tsx`, `icons.module.css`.
- `frontend/src/gallery/Gallery.tsx`, `strings.ts` -- register both components (gallery text stays in `strings.ts`).
- `frontend/src/styles/tokens.css` -- reuse `--color-domain-*`, `--radius-*`, `--space-*`; do not edit values.
- Do not touch: `frontend/src/i18n/`, any core control, `App.tsx`.

## Tasks & Acceptance

**Execution:**
- [x] `frontend/src/domain/domainTint.ts` + test -- mapping function; story cases plus tie, longest-wins, whole-word ("playground" is no match), case, punctuation ("oral-motor"), empty and whitespace input
- [x] `frontend/src/domain/DomainTag.tsx` + test -- label always rendered, tint per family, `domain-other` still shows its label
- [x] `frontend/src/icons/*` + test -- icons for Today, Goals, Activities, Share, Family and gallery samples (book, blocks, ball, leaf); IconTile sizes 76, 56, 36; stroke 2.4; fails if a nav destination has no icon; no banned names
- [x] Gallery registration + test
- [x] README review, changelog, security report, review pass and triage

**Acceptance Criteria:**
- Given "social interaction and play", "early motor and sensory skills", "oral-motor" and an unknown Domain, when `domainTint` is called, then it returns joint-attention, motor-imitation, sensory and other.
- Given any Domain name, when `DomainTag` renders, then the text label is present and the tint is a Domain token.
- Given `IconTile` at 76, 56 and 36px, when rendered, then it is a card-coloured tile with a 2.4px-stroke icon and no shadow.
- Given the five nav destinations, when the icon registry is checked, then each has an icon, else the test fails.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Lookbehind in the keyword regex fails at import on Safari before 16.4 and would blank any screen importing it [EC] | low | patch, fixed | `domainTint.ts` now uses `(?:^|[^\p{L}\p{N}])`; new start/end/punctuation test in `domainTint.test.ts` |
| 2 | Long free-text Domain has no wrap rule on the tag [VG] | low | patch, fixed | `overflow-wrap: anywhere` in `domain.module.css` |
| 3 | Gallery test hard-codes 27 tiles and lacks the `[P1]` prefix; confusing tie-test comment [VG, BH] | low | patch, fixed | `Gallery.test.tsx` derives the count from the name lists; comment reworded in `domainTint.test.ts` |
| 4 | Empty or whitespace Domain renders an empty pill [EC, BH, VG] | low | rejected | Domain is required data (PRD); the fix adds a guard branch and no screen can pass a blank Domain yet |
| 5 | Null or undefined Domain is coerced to text [EC] | false | rejected | The parameter is typed `string`; `tsc` rejects null |
| 6 | Underscore, en dash or non-breaking space between words falls to `motor` [EC] | low | rejected | DESIGN.md rule is whole-word keywords; only the hyphen form is specified; the fix widens the rule beyond the spec |
| 7 | `tint` ignored at 76 and 56px [EC, BH] | false | rejected | Intended: DESIGN.md icon-tile makes only the 36px plan-row tile tinted; covered by the "only the 36px tile takes a Domain tint" test |
| 8 | Unknown icon name renders an empty tile [EC] | false | rejected | `IconName` is a closed union and `Record<IconName, ...>` forces every name to have a glyph |
| 9 | `non-scaling-stroke` may differ under zoom [EC] | false | rejected | The property keeps 2.4px in CSS pixels, which is the specified behaviour; e2e reads 2.4px |
| 10 | 36px tile is tinted, not card-coloured, against AC3 wording [EC] | false | rejected | Design Notes in this spec and DESIGN.md icon-tile note set the 36px tile to the Domain tint |
| 11 | Text contrast on tints is not tested [BH] | false | rejected | `tokens.contrast.test.ts` already checks ink on every domain tint in both modes (Story 2.1) |
| 12 | Gallery tint-to-icon pairing is arbitrary; tiles have only a tooltip name [BH] | low | rejected | Gallery is a developer sheet; icons are decorative by spec; fix adds visible captions for no user harm |
| 13 | Hyphen counts as a word boundary ("play-based") [BH] | false | rejected | Intended and required by the "oral-motor" case |
| 14 | Plurals, diacritics and regex-escaping of keywords untested [BH] | low | rejected | Spec is whole-word; keyword table is a constant with no metacharacters; no user can reach it |
| 15 | Banned-name test regex is broad and checks names only [BH, VG] | low | rejected | False positives only make the test stricter; drawn shapes are reviewed by humans |
| 16 | Tie-break depends on table order, only two tie cases [BH] | low | rejected | Order mirrors DESIGN.md, and both tie cases in `domainTint.test.ts` pin it |
| 17 | e2e visual checks are not run in CI [VG] | medium | rejected | The Playwright CI job and axe harness are Story 2.7's scope (epic 2, "2.7 comes last and tests everything above"); the spec's Verification runs `npm run test:e2e` |
| 18 | Only one of seven tints and no 36px tint checked in the browser [VG] | low | rejected | Unit tests pin the token name per family; `tokens.test.ts` pins the values; low harm |
| 19 | README, changelog and docs absent from diff [BH] | low | patch, fixed | Written in this story's finishing steps (see changelog) |

## Design Notes

- No spec change is needed: the code follows UX-DR3, UX-DR4, UX-DR5 and UX-DR13 and DESIGN.md. Nav icon names are the five destination keys, so Story 2.3 binds labels from the catalog.
- 36px plan-row tiles are Domain-tinted at radius `sm`; 56 and 76px tiles are white `card` at radius `lg` (DESIGN.md icon-tile).

## Verification

**Commands:**
- `cd frontend && npm run typecheck && npm run lint && npm test` -- expected: green
- `cd frontend && npm run test:e2e` -- expected: green (gallery shows both components)
