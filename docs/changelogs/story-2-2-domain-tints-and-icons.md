# Changelog: Story 2.2, Domain tints and icons

| | |
|---|---|
| Story | 2.2, issue #36 |
| Epic | 2, App shell and design foundations |
| Branch | feature/epic-02-issue-36-domain-tints-and-icons |
| Commits | the story commit that carries this file (see `git log`) |
| Date | 2026-11-06 |
| Security report | [story-2-2-domain-tints-and-icons.md](../security-reports/story-2-2-domain-tints-and-icons.md) |

## Summary

Free-text Domains now map to one of the seven DESIGN.md tint families, and the frontend gets the object line icons and icon tiles the shell and screens will use. Both are shown in the gallery.

## Added

- `domainTint(name)` in `frontend/src/domain/`: whole-word, case-insensitive keyword match; longest keyword wins, ties go to the family higher in the table, no match is `other`.
- `DomainTag`: the Domain's own label on its family tint, in light and dark.
- `frontend/src/icons/`: nine flat line icons (Today, Goals, Activities, Share, Family, book, blocks, ball, leaf) with a 2.4px stroke, and `IconTile` at 76, 56 and 36px (the 36px plan-row tile is Domain-tinted at the small radius).
- Gallery sections "Domain tints" and "Icons".

## Changed

- None. No spec changed; the code follows DESIGN.md and UX-DR3, UX-DR4, UX-DR5 and UX-DR13.

## Fixed

- Found in review: the keyword regex no longer needs lookbehind support, and long Domain labels wrap.

## Removed or deprecated

- None.

## Security

PASS, no blocking findings, no new warnings from this story. See the [security report](../security-reports/story-2-2-domain-tints-and-icons.md).

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | Reviewed, no change | Setup |
| Development | New paragraph on Domain tints and icons | Development |
| Release | Reviewed, no change | Release |
| Deployment | Reviewed, no change | Deployment |

Prerequisites, Layout and Versions reviewed, no change.

## After you pull

`cd frontend && npm ci`.

## Tests

- Vitest: 75 passed (15 added: tint mapping 8, DomainTag 2, icons 4, gallery 1).
- Playwright (Chromium): 19 passed, 3 skipped (red-phase and API sample); 2 added for tints and tile rendering.
- `npm run typecheck` and `npm run lint` clean.

## Deferred and known issues

None. Review findings and their routes are in the spec's Review Triage Log; the Playwright CI job is Story 2.7.
