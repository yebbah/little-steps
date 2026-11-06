# Changelog: Story 2.10, Catalog copy for status lines, banners and empty states

| | |
|---|---|
| Story | 2.10, issue #105 |
| Epic | 2, App shell and design foundations |
| Branch | story/2-10 |
| Commits | see the branch history |
| Date | 2026-11-06 |
| Security report | [story-2-10-catalog-copy-for-status-lines-banners-and-empty-states.md](../security-reports/story-2-10-catalog-copy-for-status-lines-banners-and-empty-states.md) |

## Summary

The message catalog now holds every status line, banner, empty-state and in-progress string the UX spine names, under stable keys, with a test that fails when a spine string is missing or reworded. A small `tf()` helper fills value placeholders. Errors, destructive confirmations, security notices, consent, camera, invite and session strings follow in Story 2.11.

## Added

- 36 catalog keys in `frontend/src/i18n/messages.ts` under `status.*`, `banner.*`, `empty.*` and `state.*`, worded exactly as the spine (UX-DR137).
- `tf(key, values)`: like `t()`, and replaces `{name}` placeholders; a missing value leaves the placeholder visible, an unknown key returns the key.
- `frontend/src/i18n/spine-copy.test.ts`: expected-text table per group, a per-group key listing, drift detection (removed, reworded, extra key), a placeholder-shape check and `tf()` cases.

## Changed

- None. No spec changed; the 2.10/2.11 string split was approved in the story spec.

## Fixed

- None. Review found only test-strength gaps, fixed in the same story (see the spec's Review Triage Log).

## Removed or deprecated

- None.

## Security

PASS with no blocking findings and no new dependency. See the [security report](../security-reports/story-2-10-catalog-copy-for-status-lines-banners-and-empty-states.md).

## Operations impact

| Area | What changes (README is reviewed every story; write "reviewed, no change" if untouched) | README section |
|---|---|---|
| Setup | Reviewed, no change | Setup |
| Development | Reviewed, no change (the frontend text rule already covers new catalog keys) | Development |
| Release | Reviewed, no change | Release |
| Deployment | Reviewed, no change | Deployment |

README also checked for Prerequisites, Layout and Versions: reviewed, no change.

## After you pull

Nothing to do.

## Tests

New: `frontend/src/i18n/spine-copy.test.ts` (exact text for 36 keys, key listing per group, drift detection, `tf()` matrix rows: known, missing, unknown key). Existing `messages.test.ts` runs the tone check over the new strings. Commands: `cd frontend && npm test` (111 passed, 0 failed), `npm run lint`, `npm run typecheck`, `npm run build` (all pass).

## Deferred and known issues

None. Nothing consumes the new keys yet; the screens that do arrive in later stories. Plural handling for `status.itemsCovered` ("1 items covered") was rejected as out of scope (spine wording is verbatim; consumer is the P2 masking review).
