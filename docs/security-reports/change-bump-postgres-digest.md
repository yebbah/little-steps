# Security report: Bump the PostgreSQL 18-alpine digest to the current image

| | |
|---|---|
| Issue | none |
| Branch | chore/bump-postgres-digest |
| Commit scanned | the commit on this branch (the pre-commit hook scans it) |
| Date | 2026-11-11 |
| Verdict | PASS WITH WARNINGS |

## 1. Summary

Moves the PostgreSQL pin to the tag's current image. The previous pin was newly blocked by the scan (one CISA KEV finding, CVE-2026-125350 in libxslt, and High findings in krb5-libs and libxslt). The new image has none of them. Verdict: pass with warnings (the usual frontend warnings, unchanged).

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above. Numbers are from the local scan of the branch (`build/security/summary.txt`).

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 178 | PASS | 0 | 0 |
| Frontend dependencies | 657 | PASS | 0 | 3 (unchanged: deepmerge, glob, minimatch) |
| Container images | PostgreSQL 0 components flagged; others unchanged | PASS | 0 | unchanged |

Before: `dhi.io/postgres@sha256:af919daf…` FAIL (2 components flagged, 11 blocking findings, one in KEV). After: `dhi.io/postgres@sha256:0cdbc51a…` PASS.

## 3. Exceptions

No exception was added or changed.

## 4. Container images

| Image | Source | Digest | Why not DHI |
|---|---|---|---|
| dhi.io/postgres:18-alpine | dhi | sha256:0cdbc51a89a592296aa6d2ef7063f4db283dab5aea4a351ccbd89bb97907c4b4 | n/a |

## 5. Supply chain

The digest is pinned in `deploy/images.yaml` and `deploy/compose.yaml`, and `deploy/check-images.sh` confirms they agree.

## 6. Secrets and data handling

Secret scan clean. No data handling changed.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| Image manifest check | `deploy/check-images.sh` | OK |
| Scan | `deploy/security-scan.sh` | PASS |

## 8. Review findings with security impact

No reviewer pass was run outside a story.

## 9. Residual risks and follow-ups

None.

## 10. Sign-off

Accepted by the maintainer's instruction to merge on 2026-11-11.
