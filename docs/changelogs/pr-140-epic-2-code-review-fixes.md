# Changelog: Pull request #140, Fix Epic 2 code review findings

| | |
|---|---|
| Pull request | #140, issue #3 (Epic 2); deferred #136 to #139 |
| Kind | Fix (frontend); not a story |
| Origin | The Epic 2 code review: 16 reviews over four groups |
| Branch | chore/epic-02-code-review-fixes |
| Commits | 764e854 (squashed on merge) |
| Date | 2026-11-07 |
| Size | 38 files, +566 −48 |
| Security report | [pr-140-epic-2-code-review-fixes.md](../security-reports/pr-140-epic-2-code-review-fixes.md) |

## Summary

Fixes 22 verified findings from the Epic 2 code review, defers #136 to #139, and records the rest in the code review report. One spec conflict (Story 2.2 white tiles against the tinted 36 px tile in DESIGN.md) is surfaced for a human decision rather than changed.

## Added

- Added 6 file(s): `.specs/implementation-artifacts/epic-2-code-review-2026-11-07.md`, `frontend/src/pwa/register.test.ts`, `frontend/src/shell/usePinnedBottom.test.tsx`, `frontend/src/surfaces/ActionRow.test.tsx`, `frontend/src/surfaces/robustness.test.tsx`, `frontend/src/ui/robustness.test.tsx`

## Changed

- Changed 32 file(s): `.specs/implementation-artifacts/deferred-work.md`, `frontend/e2e/README.md`, `frontend/e2e/tests/route-change.spec.ts`, `frontend/e2e/tests/settings.spec.ts`, `frontend/e2e/tests/tokens-theme.spec.ts`, `frontend/index.html`, `frontend/scripts/stylelint-rules.test.sh`, `frontend/src/build/pwa-build.test.ts`, `frontend/src/domain/DomainTag.tsx`, `frontend/src/gallery/Gallery.test.tsx`, `frontend/src/gallery/Gallery.tsx`, `frontend/src/gallery/Surfaces.tsx` and 20 more

## Fixed

- None

## Removed or deprecated

- None

## Security

Frontend source and tests changed; no dependency manifest, workflow or image pin changed. Verdict: pass with warnings. Details, scan numbers and the scan source are in the [security report](../security-reports/pr-140-epic-2-code-review-fixes.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | No change |
| Release | No change |
| Deployment | No change |

README section(s) concerned: Not applicable (code fixes).

README.md was not changed in this pull request.

## After you pull

Nothing to do.

## Tests

From the pull request description: 331 unit tests, 89 Playwright tests, lint, typecheck and build passed locally. The CI run concluded successfully on the pull request.

The CI run on the pull request concluded successfully.

## Deferred and known issues

#136 to #139 (deferred findings); the Story 2.2 tile conflict was resolved later by the maintainer in #141.
