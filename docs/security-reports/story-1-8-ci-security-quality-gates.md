# Security report: Story 1.8, Continuous integration with security and quality gates

| | |
|---|---|
| Story | 1.8, issue #33 |
| Branch | feature/epic-01-issue-33-ci-security-quality-gates |
| Commit scanned | working tree on baseline f66e007e124a4111f828d576e6e9de02af250076 (not committed yet) |
| Date | 2026-11-06 |
| Verdict | PASS WITH WARNINGS (3 frontend warnings below 7.0; the first CI run needs the DHI secrets for the Backend job; image scans are manual, #95) |

## 1. Summary

The story adds the CI workflow, an action-pinning check, a commit-history mode for the secret scan, JaCoCo and Vitest (a new dev-only frontend dependency set). The full local scan passes (`RESULT: PASS`) and `scan app-image` passes locally. CI runs only the secret scan and the backend and frontend dependency scans; the first CI run also showed a new blocking CVE in the Keycloak and JDK images (zlib1g CVE-2026-76844, no fix), which the manual image scans will report (#95). No new exception.

## 2. Scan result

Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above. Two runs: before handing over, and after the review fixes (identical result).

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Secrets (gitleaks, commit history) | n/a | PASS | 0 | 0 |
| Backend dependencies | 93 | PASS | 0 | 0 |
| Frontend dependencies (463, was 439) | 463 | PASS | 0 | 3 |
| Container images (postgres, keycloak, node, 2 x eclipse-temurin, mailpit) | 0 / 25 / 3 / 1 / 12 / 3 | PASS | 0 | 120 |
| Built app image (`scan app-image`) | 12 | PASS | 0 | see story 1.5 |

### Warnings (below 7.0, not in KEV)

| Package | Version | CVE | CVSS | Fixed in | Decision |
|---|---|---|---|---|---|
| deepmerge | 4.3.1 | CVE-2026-93753 | 5.3 | none | accepted: transitive dev dependency of the test tooling, not shipped |
| glob | 11.1.0 | CVE-2026-118773 | 6.3 | 14.0.2 | accepted: transitive dev dependency, not shipped; picked up by the next Vitest update |
| minimatch | 10.2.6 | CVE-2026-118764 | 6.9 | 11.0.1 | accepted: transitive dev dependency, not shipped; same |

Image warnings are unchanged from Stories 1.3 and 1.5.

## 3. Exceptions

No change. The existing exceptions (Story 1.3 Keycloak/Debian base packages and Story 1.5 alsa-lib) expire 2026-12-04 and are tracked in #56 and #68.

## 4. Container images

No image added or changed. The Backend job logs in to `dhi.io` with the `DHI_USERNAME` and `DHI_TOKEN` repository secrets so Testcontainers can pull PostgreSQL. CI does not scan or build images (#95). Images from outside Docker Hardened Images remain `axllent/mailpit` (local only) as in Story 1.3.

## 5. Supply chain

- Actions used (all `actions/*`, pinned to full SHAs with the version in a comment, enforced by `deploy/check-actions.sh`): checkout v7.0.1, setup-java v6.2.0, setup-node v7.1.0, cache v6.1.0, upload-artifact v7.0.2.
- New dependencies: jacoco-maven-plugin 0.8.16 (build only), vitest 5.1.0 and @vitest/coverage-v8 5.1.0 (dev only, locked in package-lock.json).
- Scan tools are fetched with verified checksums on every run and are not cached; the KEV feed is not cached; only the Grype database is cached.
- Workflow token is `contents: read`; checkout does not persist credentials; no `pull_request_target`; secrets are used only in the Backend job's dhi.io login step.
- A guard step fails the Security job if any `LS_*` test hook other than `LS_SECRETS_SCOPE` is set (resolves #73).

## 6. Secrets and data handling

Secret scan over the commit history: clean. CI adds two secrets (`DHI_USERNAME`, `DHI_TOKEN`), passed through an environment variable and `--password-stdin`, never echoed. Reports uploaded as artifacts (30 days) contain package names and CVE ids only, no child data. Fork pull requests do not receive the secrets, so the Backend job fails closed for them.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive and negative | `deploy/tests/check-actions.test.sh` | 17 passed |
| New positive and negative | `deploy/tests/ci-workflow.test.sh` | 31 passed (incl. a negative case) |
| New positive and negative | `deploy/tests/security-scan.test.sh` (history scope, unknown scope, shallow clone) | 72 passed, 0 failed |
| New | `npm run test:coverage` | 1 passed |
| Non-regression | `./mvnw verify` (11 tests), lint, typecheck, build, other `deploy/tests/*.test.sh`, shellcheck, actionlint 1.7.7, `check-images.sh` | all pass |

## 8. Review findings with security impact

Three separate reviewers (blind, edge case, verification gap). The high finding (cache restore could replace scanner binaries or hide a KEV listing) is fixed; the vacuous secret scan on a mistyped scope is fixed. Full table: Review Triage Log in `.specs/implementation-artifacts/spec-1-8-ci-security-quality-gates.md`.

## 9. Residual risks and follow-ups

| Item | Risk | Owner |
|---|---|---|
| Fork and Dependabot PRs fail the Security job; full-history secret scan | contributor friction, an old rotated leak would fail every run | [#90](https://github.com/yebbah/little-steps/issues/90) |
| OpenAPI drift, ModularityTests and Testcontainers not yet mandatory | a missing check passes silently | [#88](https://github.com/yebbah/little-steps/issues/88) |
| Coverage is reported, not gated | coverage can fall unnoticed | [#89](https://github.com/yebbah/little-steps/issues/89) |
| The workflow has not run on GitHub yet | first run may expose environment differences | validate on the first push |

## 10. Sign-off

Signed off by the maintainer on 2026-11-06. Scope amended after sign-off: image scans removed from CI at the maintainer's request (#95). Condition: merge after the first green CI run on GitHub with the `DHI_USERNAME` and `DHI_TOKEN` secrets added.
