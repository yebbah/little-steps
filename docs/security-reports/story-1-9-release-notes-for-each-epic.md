# Security report: Story 1.9, Release notes for each epic

| | |
|---|---|
| Story | 1.9, issue #34 |
| Branch | feature/epic-01-issue-34-release-notes |
| Commit scanned | working tree on baseline f66e007 (not committed yet) |
| Date | 2026-11-06 |
| Verdict | PASS |

## 1. Summary

The story adds a bash script, its tests and documentation. It adds no dependency, image, action or network access. The full scan passes (`RESULT: PASS`).

## 2. Scan result

Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 93 | PASS | 0 | 0 |
| Frontend dependencies | 439 | PASS | 0 | 3 |
| Container images | 44 (5 scanned images) | PASS | 0 | warnings only, plus excepted findings under existing exceptions |

Totals by severity over all targets (including excepted): High 29 (all excepted, no fix upstream), Medium 84, Low 18, Negligible 45. KEV findings: 0. Run twice per CONTRIBUTING: before validation and after the review fixes; both PASS.

### Warnings (below 7.0, not in KEV)

Unchanged from earlier stories (Keycloak and Eclipse Temurin base packages with no fix, Mailpit busybox, three frontend dev packages). Full per-package lists are printed by `deploy/security-scan.sh` and stored in `build/security/`. Decision: accepted, tracked in the Story 1.3 and 1.5 issues (#56, #68).

## 3. Exceptions

No change. The Story 1.3 Keycloak set (#56) and the alsa-lib build-image entry (#68) expire 2026-12-04 and are listed in the Epic 1 release note.

## 4. Container images

No image added or changed. Images outside Docker Hardened Images stay warnings in the release note: Mailpit (scanned), Presidio analyzer and anonymizer (`scan: deferred`, Epic 18). The release note generator prints one warning line per `other` entry in `images.yaml`.

## 5. Supply chain

None. `release-notes.sh` uses only bash, git, jq, awk and sed already required by the repository.

## 6. Secrets and data handling

Secret scan clean. The script reads reports and repository files only and writes one Markdown file; it makes no network call. The generated note contains no secret values: environment variables are listed by name only (never values) and ports are the public defaults. Notes are checked for absolute local paths in the test suite.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `deploy/tests/release-notes.test.sh` | generation and pass cases, included in 79 passed |
| New negative tests | `deploy/tests/release-notes.test.sh` | rejection cases, included in 79 passed |
| Non-regression suite | `deploy/tests/*.test.sh` | 24 + 10 + 70 + 21 + 79 + 67 passed, 0 failed (271 total) |

## 8. Review findings with security impact

Three reviewers ran. Relevant: arithmetic and awk code fed from a report file (fixed with numeric guards), a note that could show a green zero from an empty scan (fixed: shown as TODO, check fails), `tag` allowed on a dirty tree (fixed). Triage: [spec Review Triage Log](../../.specs/implementation-artifacts/spec-1-9-release-notes-for-each-epic.md).

## 9. Residual risks and follow-ups

| Item | Risk | Owner |
|---|---|---|
| Markdown cells not escaped | A CVE reason containing a pipe breaks a table | #86 |
| `tag` not tied to `main` | Tag on the wrong commit if run from a branch | #86 |
| Epic 1 note finished (`Status: done`), passes `check --strict`; tag `epic-01` after merge | none | resolved, #85 |

## 10. Sign-off

Signed off by the maintainer on 2026-11-06.
