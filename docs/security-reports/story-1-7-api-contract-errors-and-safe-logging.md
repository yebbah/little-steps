# Security report: Story 1.7, API contract, errors and safe logging

| | |
|---|---|
| Story | 1.7, issue #32 |
| Branch | feature/epic-01-issue-32-api-contract-errors-logging |
| Commit scanned | working tree on baseline f66e007e124a4111f828d576e6e9de02af250076 (not committed yet) |
| Date | 2026-11-06 |
| Verdict | PASS |

## 1. Summary

The story adds the error format, the API contract and the redacting types that enforce AD-19. One new backend library family (springdoc) was added. The full scan passes (`RESULT: PASS`) with no new warnings or exceptions.

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 103 (was 93) | PASS | 0 | 0 |
| Frontend dependencies | 439 | PASS | 0 | 3 (unchanged) |
| Container images | unchanged | PASS | 0 | unchanged |

### Warnings (below 7.0, not in KEV)

No new warnings. The frontend warnings (deepmerge, glob, minimatch) existed before this story.

## 3. Exceptions

No change. The existing Keycloak, glibc and alsa-lib exceptions expire 2026-12-04 (#56, #68).

## 4. Container images

No change. The app image build only runs `-DskipTests package`, so the OpenAPI test does not affect it; images were not rebuilt.

## 5. Supply chain

Added `org.springdoc:springdoc-openapi-starter-webmvc-api` 3.2.0 (Maven Central, version pinned in `pom.xml`). `openapi-typescript` 7.13.0 and `typescript` 5.9.3 run through `npx` at pinned versions, outside `package.json`, as the architecture (AD-20) requires; they are not in the lockfile, so their transitive dependencies are not scanned (noted in the review triage, row 18).

## 6. Secrets and data handling

Secret scan clean. This story is the privacy control for logs: free text is wrapped in redacting types, access lines carry the method, matched route pattern, status and duration only, unhandled exceptions log the class name and stack trace (accepted for now, see #91), and problem responses omit `detail`. API docs are off by default (`springdoc.api-docs.enabled=false`), and Swagger UI is off.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `cd backend && ./mvnw verify` | pass (ping, boundaries, value types, JSON logs with request ID) |
| New negative tests | same | pass (secret absent from logs and responses, 400/404/405/406/500 problems, unsafe request ID) |
| Non-regression suite | same, plus `npm run build`, `lint`, `lint:test`, `api:check` | 42 passed, 0 failed |

## 8. Review findings with security impact

Three reviewers ran (blind, edge cases, verification gaps); the triage is in the spec's Review Triage Log. Fixed: raw path in the access line, missing problem types, `/v3` falling to the SPA fallback, weak log tests. Deferred: container-level errors and future security exceptions (#79), async request ID (#82). Rejected: client-supplied request ID spoofing (IDs only correlate logs).

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Errors outside DispatcherServlet bypass problem+json and may log exception messages | Container logs could contain request values | #79 |
| Stack traces of unhandled exceptions are logged and can contain request values (decision on #32) | Caregiver text in container logs until error references replace it | accepted, #91 |
| Lint rule ignores JSX props and string constants | User-facing text in aria-label or constants | #81 |
| `ProblemDetail.instance` echoes the request path | Harmless until path variables carry text | accepted, revisit with #79 |

## 10. Sign-off

Signed off by the maintainer on 2026-11-06. Accepted: `urn:littlesteps:problem:<slug>` problem types, oxlint for the JSX-literal rule, full stack traces in logs for unhandled exceptions until error references arrive (#91), and `openapi-typescript` run through `npx` (not in the lockfile).
