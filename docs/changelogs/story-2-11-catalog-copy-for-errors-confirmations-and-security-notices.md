# Changelog: Story 2.11, Catalog copy for errors, confirmations and security notices

| | |
|---|---|
| Story | 2.11, issue #106 |
| Epic | 2, App shell and design foundations |
| Branch | story/2-11 |
| Commits | see the branch history |
| Date | 2026-11-06 |
| Security report | [story-2-11-catalog-copy-for-errors-confirmations-and-security-notices.md](../security-reports/story-2-11-catalog-copy-for-errors-confirmations-and-security-notices.md) |

## Summary

The message catalog now holds every error, destructive or share confirmation, consent and permission notice, invite string and security notice that the UX spine names exactly, under stable keys, with a test that fails when one is missing or reworded. Together with Story 2.10 the catalog covers the strings the spine names for the core states.

## Added

- 27 catalog keys in `frontend/src/i18n/messages.ts` under `error.*` (8), `invite.*` (5), `consent.*` (2), `confirm.*` (8) and `security.*` (4), worded exactly as the spine (UX-DR137).
- `frontend/src/i18n/error-copy.test.ts`: expected-text table per group, per-group key listing, drift detection (removed, reworded, extra key), a `tf()` fill check over every key, and a blame-wording check across the five groups. Story 2.10's `spine-copy.test.ts` is unchanged.

## Changed

- None. No spec changed; the epic text and the spine already describe this behaviour (autopilot approval of the story spec, 2026-11-06).

## Fixed

- None. Review found only test-strength gaps, fixed in the same story (see the spec's Review Triage Log).

## Removed or deprecated

- None.

## Security

PASS with no blocking findings and no new dependency. See the [security report](../security-reports/story-2-11-catalog-copy-for-errors-confirmations-and-security-notices.md).

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

New: `frontend/src/i18n/error-copy.test.ts` (exact text for 27 keys, key listing per group, drift detection, `tf()` fill of every key and exact cases, blame-wording check). Existing `messages.test.ts` runs the tone check over the new strings. Commands: `cd frontend && npm test` (189 passed, 0 failed), `npm run lint`, `npm run typecheck`, `npm run build` (all pass).

## Deferred and known issues

- [#119](https://github.com/yebbah/little-steps/issues/119) (target 2027-02-04): two spine sentences that no copy story owns, "This goal hasn't been discussed with your care team yet." and the reminder example copy.
- Nothing consumes the new keys yet; the screens that do arrive in later stories. Automatic spine-to-catalog coverage is tracked in #110.
