# Security report: Story 1.4, Start and stop scripts

| | |
|---|---|
| Story | 1.4, issue #29 |
| Branch | story-1-4-start-and-stop-scripts |
| Commit scanned | d9bfa15 (baseline 590a637a4441ca6454c93cbd07bcec4c0ad1a912); scanned by the pre-commit hook at commit |
| Date | 2026-11-06 |
| Verdict | PASS WITH WARNINGS (unchanged warnings; the 16 Keycloak exceptions from Story 1.3 remain) |

## 1. Summary

This story adds two bash scripts and documentation. It changes no image, compose service, dependency or scan rule. The full scan passes (`RESULT: PASS`), with the same exceptions and warnings as Story 1.3.

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS (nothing staged at run time; the hook rescans at commit) | 0 | 0 |
| Backend dependencies | 93 | PASS | 0 | 0 |
| Frontend dependencies | 439 | PASS | 0 | 3 |
| Container images | 28 (postgres 0, keycloak 25, mailpit 3) | PASS | 0 | 52 warn lines in build/security/summary.txt (all targets) |

### Warnings (below 7.0, not in KEV)

Unchanged from the [Story 1.3 report](story-1-3-hardened-local-infrastructure.md): frontend dev dependencies, Mailpit busybox, and Keycloak base packages. Accepted for local development; full list in `build/security/summary.txt`.

## 3. Exceptions

The 16 Keycloak exceptions from Story 1.3 (`security/exceptions.yaml`), expiring 2026-12-04, tracked in #56. None added or changed.

## 4. Container images

No change. See the Story 1.3 report and `deploy/images.yaml`; `deploy/check-images.sh` reports OK.

## 5. Supply chain

None. `dev-up.sh` reads the pinned tool versions from `security-scan.sh` and does not download anything. `shellcheck` is a developer-side lint installed with Homebrew and is not part of the build or CI yet.

## 6. Secrets and data handling

- No secret is committed; `local.env.example` gets only two non-secret placeholders (`LS_AI_REQUIRED`, `OLLAMA_MODEL`). `dev-up.sh` never prints values from `local.env` other than ports, database name and user, and it reads only non-secret keys.
- `dev-up.sh` never overwrites an existing `local.env`. It checks the `dhi.io` login by looking for the registry name in the Docker config, and does not read or print credentials.
- `dev-down.sh --wipe` is destructive by design: it needs the typed word `wipe` (or `--yes`), aborts on anything else including no input, and removes only `data/` under the repository root (a symlink there is removed, not followed).
- No application code, logging or child data handling changed.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `deploy/tests/dev-scripts.test.sh` | fresh start, re-run, ports from `local.env`, stop keeps data, wipe confirmed and `--yes`, AI optional and required with the model present |
| New negative tests | `deploy/tests/dev-scripts.test.sh` | missing Docker, `dhi.io` login, Java 21, tools, Node (nothing changed in each case); AI required without the model; health timeout; wipe declined, EOF; bad arguments. 46 passed in total (incl. failed init service, similar model name, wipe with Docker down) |
| Non-regression suite | `check-images.test.sh`, `realm.test.sh`, `security-scan.test.sh` | 15, 21 and 63 passed, 0 failed |
| Lint | `shellcheck` on the three new scripts | clean |

## 8. Review findings with security impact

The independent three-reviewer pass ran (blind, edge-case, verification-gap). No finding had a security impact beyond the wipe safeguards above; the one hardening patch moves the Docker check before the `--wipe` prompt. Findings and routes are in the spec's Review Triage Log. Deferred: #65 and #66.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| `--yes` removes data without a prompt | An accidental `--wipe --yes` deletes local data | Accepted: local data is disposable and the flag is explicit |
| Real Docker stack not exercised by tests | A compose-output format change could break the unhealthy-service naming | Manual check in the spec Verification |
| Keycloak exceptions | See Story 1.3 | #56 |

## 10. Sign-off

Pending: human validation.

## Addendum: `deploy/check-urls.sh` (scope added after the review pass)

Read-only `curl` GETs and an `nc -z` port probe against `localhost` only; no credentials are sent, stored or printed, and nothing is written outside a temp file for the response body. Covered by `deploy/tests/check-urls.test.sh`. Re-scan result: see the changelog's Tests section. It was not part of the three-reviewer pass above; it is small enough that a separate pass was not run, which the human can overrule.
