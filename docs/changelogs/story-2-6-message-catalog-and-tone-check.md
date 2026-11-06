# Changelog: Story 2.6, Message catalog and tone check

| | |
|---|---|
| Story | 2.6, issue #40 |
| Epic | 2, App shell and design foundations |
| Branch | story/2-6 |
| Commits | see the branch history |
| Date | 2026-11-06 |
| Security report | [story-2-6-message-catalog-and-tone-check.md](../security-reports/story-2-6-message-catalog-and-tone-check.md) |

## Summary

The frontend message catalog now holds its first strings, the two standard labels, and a tone check fails the build when a catalog string contains judging or alarming wording. A checklist of banned UI patterns gives reviewers one place to check against.

## Added

- Catalog keys `label.aiSuggested` and `label.proposedByYou` with the exact standard wording (UX-DR136).
- `frontend/src/i18n/tone.ts`: the banned-phrase list and `findBannedPhrases()` (whole-word, case-insensitive; also flags "8/10" and "8 out of 10" scores).
- `frontend/src/i18n/messages.test.ts`: lookup, visible unknown key, label wording, key shape, tone over the whole catalog, and checker positive and negative cases.
- `docs/ui-review-checklist.md`: banned UI patterns and wording checks (UX-DR115).

## Changed

- `t()` no longer resolves inherited object properties (for example `toString`) and returns a visible marker for an empty key; an unknown key still shows the key itself.
- The release note template and its README point feature epics to the UI review checklist under "Code quality".
- README: the frontend text rule now names the tone check and the checklist.

## Fixed

- None.

## Removed or deprecated

- None.

## Security

PASS with no blocking findings and no new dependency. See the [security report](../security-reports/story-2-6-message-catalog-and-tone-check.md).

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | reviewed, no change | Setup |
| Development | Tone check runs in `npm test`; catalog and checklist named | Development |
| Release | Release note template references the UI review checklist | Release |
| Deployment | reviewed, no change | Deployment |
| Layout | `docs/` line mentions the UI review checklist | Layout |
| Prerequisites, Versions | reviewed, no change | Prerequisites, Versions |

## After you pull

Nothing to do. `cd frontend && npm ci` if dependencies are not installed.

## Tests

- New: 27 Vitest cases in `messages.test.ts` (positive: label wording, lookup, clean catalog, accepted near-misses such as "dismissed", "1/100", "2026/10"; negative: each banned phrase flagged, unknown and empty keys). `cd frontend && npm test`.
- Non-regression: frontend 27 passed, 2 skipped (red-phase tests from the Epic 2 test design); lint, typecheck and build clean; `deploy/tests/release-notes.test.sh` 79 passed.

## Deferred and known issues

- [#110](https://github.com/yebbah/little-steps/issues/110): tone and catalog coverage beyond catalog values (attribute strings, key usage, phrase variants), target 2027-02-04.
