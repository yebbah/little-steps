# Changelog: Pull request #168, Time-limit the latest-image lookup in the security scan

| | |
|---|---|
| Pull request | #168, issue #163 |
| Kind | Fix (tooling); not a story |
| Origin | Found on 2026-11-08: the pre-commit scan hung for 17 minutes on the registry lookup added in #147 |
| Branch | feature/epic-01-issue-163-lookup-timeout |
| Commits | bfb30f7 (squashed on merge) |
| Date | 2026-11-09 |
| Size | 3 files, +31 −4 |
| Security report | [pr-168-latest-image-lookup-timeout.md](../security-reports/pr-168-latest-image-lookup-timeout.md) |

## Summary

The check that compares a pinned image digest with the tag's current digest had no time limit, so a slow registry could block every commit. The lookup is now cut off after 30 seconds and counts as a failed lookup, which the rule already treats as a fix being available.

## Added

- `run_limited` in `deploy/security-scan.sh`: runs a command and kills it after N seconds (macOS has no `timeout`).
- `LS_LOOKUP_TIMEOUT` (default 30 seconds) and a message on stderr when a lookup times out.
- Two tests: a hanging lookup is cut off within the limit and fails closed; a fast lookup is unaffected.

## Changed

- `latest_digest` runs the registry call through `run_limited`.
- `security/README.md` notes the 30-second limit.

## Fixed

- A hung `docker buildx imagetools inspect` blocking the pre-commit scan indefinitely.

## Removed or deprecated

- None

## Security

The fail-closed rule is unchanged: a lookup that does not answer counts as a fix being available, so the exception rule is not loosened by a timeout. Verdict: pass with warnings (unchanged). Details, scan numbers and the scan source are in the [security report](../security-reports/pr-168-latest-image-lookup-timeout.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | A slow registry delays the pre-commit scan by at most 30 seconds per image instead of hanging it. |
| Release | No change |
| Deployment | No change |

README section(s) concerned: Not applicable (policy text is in security/README.md).

README.md was not changed in this pull request.

## After you pull

Nothing to do.

## Tests

Two new tests in `deploy/tests/security-scan.test.sh` (hanging lookup cut off and fails closed; fast lookup unaffected); shellcheck clean. The live Grype cases in the same suite need the network and ran in CI.

All five CI jobs passed on the pull request (backend, frontend, accessibility, scripts, security).

## Deferred and known issues

None.
