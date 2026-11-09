# Changelog: Records travel in the same pull request, enforced by CI

| | |
|---|---|
| Issue | #172 |
| Kind | Policy and CI; not a story |
| Origin | Maintainer decision, 2026-11-09: no holes or gaps in the records |
| Branch | feature/epic-02-issue-172-records-in-same-pr |
| Pull request | the one opened from this branch (its number is in the squash commit title and in the index) |
| Date | 2026-11-09 |
| Security report | [change-epic-02-issue-172-records-in-same-pr.md](../security-reports/change-epic-02-issue-172-records-in-same-pr.md) |

## Summary

Replaces the rule from #169 and #171. A changelog and a security report are now committed in the same pull request as the change, named by the branch so the pull request number is not needed, and a CI check fails a pull request that carries neither. The exemption for records-only pull requests is removed. #169 and #171 get their records here; the 20 older non-story pull requests (#1 to #142) follow in the next pull request, and #172 stays open until then.

## Added

- `deploy/check-records.sh` and `deploy/tests/check-records.test.sh` (10 tests): a pull request must add or change a changelog and a security report named `story-`, `change-` or `pr-`.
- A CI step in the Scripts job (pull requests only, full history) and its test run, with guards in `deploy/tests/ci-workflow.test.sh` (50 passing).
- Records for #169 and #171 (`pr-169-...`, `pr-171-...`) and for this change (`change-epic-02-issue-172-records-in-same-pr`).

## Changed

- CONTRIBUTING, section "Non-story pull requests": records are committed with the change, named `change-<branch slug>`, numbers from the local scan, enforced by CI.
- The Scripts job checks out the full history so the check can find the merge base.
- README: the CI table lists the records check.

## Fixed

- Pull requests could ship without records: the follow-up pull request was never forced, and the exemption from #171 left two pull requests uncovered.

## Removed or deprecated

- The exemption for records-only pull requests (#171) and the "may be added in a follow-up pull request" allowance (#169).

## Security

No dependency, image or secret handling changed. The new script reads git history only, and the CI step passes the base branch name through an environment variable instead of interpolating it into the command. Verdict: pass with warnings (the usual frontend warnings, unchanged). Details, scan numbers and the scan source are in the [security report](../security-reports/change-epic-02-issue-172-records-in-same-pr.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | Every pull request needs `docs/changelogs/` and `docs/security-reports/` records; run `deploy/security-scan.sh` before writing the report. |
| Release | CI only: the Scripts job has a new step |
| Deployment | No change |

README section(s) concerned: Continuous integration (Scripts row).

## After you pull

Nothing to do. On your next branch, add `docs/changelogs/change-<branch slug>.md` and `docs/security-reports/change-<branch slug>.md` in the same pull request.

## Tests

`bash deploy/tests/check-records.test.sh`: 10 passed (no records fails; changelog only fails; both pass; README and TEMPLATE do not count; story names pass; `pr-` names pass; wrong names fail; wrong folder fails; missing base gives a clear message). `bash deploy/tests/ci-workflow.test.sh`: 50 passed. Shellcheck clean.

All CI jobs must pass before merge; the merge is gated on them.

## Deferred and known issues

Backfill of records for the 20 older non-story pull requests: the next pull request on #172. The check only verifies that a record file is added or changed, not what it says; a reviewer still reads the content. Fork and dependency-bot pull requests (#90) would need records too.
