# Changelog: Pull request #166, Retry the pinned scan tool download when GitHub releases answer 5xx

| | |
|---|---|
| Pull request | #166, issue #165 |
| Kind | CI; not a story |
| Origin | Found on PR #164, whose security job failed twice with HTTP 504 downloading grype |
| Branch | feature/epic-01-issue-165-tool-download-retry |
| Commits | e6a26bd (squashed on merge) |
| Date | 2026-11-09 |
| Size | 3 files, +38 −2 |
| Security report | [pr-166-scan-tool-download-retry.md](../security-reports/pr-166-scan-tool-download-retry.md) |

## Summary

The scanner downloads grype, syft and gitleaks from GitHub releases. A brief 5xx used to fail the whole security job; each download now retries up to four times, then fails with the URL and the last error. The checksum is still verified after the download.

## Added

- `download_file` in `deploy/security-scan.sh`: up to 4 attempts with pauses of 5, 10 and 15 seconds (`LS_DOWNLOAD_PAUSE` for tests).
- Four tests with a fake `curl` in `deploy/tests/security-scan.test.sh`.

## Changed

- `install_one` downloads through `download_file`; README notes the retry.

## Fixed

- Spurious red security jobs when GitHub releases answered 504.

## Removed or deprecated

- None

## Security

Retries do not weaken the pin: the SHA-256 of every tool archive is still checked against the value in the script, and a mismatch still stops the install. Verdict: pass with warnings (unchanged). Details, scan numbers and the CI run are in the [security report](../security-reports/pr-166-scan-tool-download-retry.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | Scan tools are still installed by `deploy/security-scan.sh install-tools`; a failed download is retried. |
| Development | No change |
| Release | CI only, no change for developers |
| Deployment | No change |

README section(s) concerned: Continuous integration (Security row).

README.md was changed in this pull request.

## After you pull

Nothing to do.

## Tests

Four new tests: first try works (1 call); two 504s then success (3 calls); three 504s then success on the last attempt (4 calls); always failing stops after 4 attempts and leaves no file. Shellcheck clean. The live Grype cases in the same suite need the network and ran in CI.

All five CI jobs passed on the pull request (backend, frontend, accessibility, scripts, security).

## Deferred and known issues

None.
