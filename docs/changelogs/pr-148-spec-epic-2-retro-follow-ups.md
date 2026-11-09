# Changelog: Pull request #148, Spec the Epic 2 retrospective follow-ups

| | |
|---|---|
| Pull request | #148, issue #143 |
| Kind | Spec; not a story |
| Origin | Epic 2 retrospective team discussion |
| Branch | feature/epic-02-issue-143-retro-follow-up-specs |
| Commits | c7b704a (squashed on merge) |
| Date | 2026-11-08 |
| Size | 9 files, +43 −18 |
| Security report | [pr-148-spec-epic-2-retro-follow-ups.md](../security-reports/pr-148-spec-epic-2-retro-follow-ups.md) |

## Summary

Records the retrospective decisions in the specs before any code: a new architecture decision for frontend layers, clearer wording for Story 2.3 (Back focus) and Story 2.8 (what counts as first open), and a listener test line for Story 3.7.

## Added

- AD-28 in the architecture spine: `surfaces` never imports from `shell`, enforced by a lint rule, with a browser evidence rule for NFR-10.
- Story 2.3 lines for a neutral `statusContext.ts` and for Back focus (`data-focus-key`, fallback to the heading); a Story 2.8 line defining first open; a Story 3.7 test line for startup resubmission and the `prod` profile (#83).
- Three memlog entries and the platform constraint in the product SPEC.

## Changed

- Epic 3's operator-module decision was renumbered AD-29.
- Epic 2 retro action table, sprint status and the deferred-work index follow the decisions.

## Fixed

- None

## Removed or deprecated

- None

## Security

No code or configuration changed. Verdict: pass with warnings (the usual frontend warnings, unchanged). Details, scan numbers and the scan source are in the [security report](../security-reports/pr-148-spec-epic-2-retro-follow-ups.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | No change |
| Release | No change |
| Deployment | No change |

README section(s) concerned: Not applicable (specs only).

README.md was not changed in this pull request.

## After you pull

Nothing to do.

## Tests

Not applicable: specs only. No test was added or changed.

All five CI jobs passed on the pull request (backend, frontend, accessibility, scripts, security).

## Deferred and known issues

Code for AD-28 follows in #149; the browser evidence is #144/#134.
