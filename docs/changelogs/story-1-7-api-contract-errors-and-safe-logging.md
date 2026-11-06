# Changelog: Story 1.7, API contract, errors and safe logging

| | |
|---|---|
| Story | 1.7, issue #32 |
| Epic | 1, Local environment and project skeleton |
| Branch | feature/epic-01-issue-32-api-contract-errors-logging |
| Commits | see the Story 1.7 commit on the branch (baseline f66e007) |
| Date | 2026-11-06 |
| Security report | [story-1-7-api-contract-errors-and-safe-logging.md](../security-reports/story-1-7-api-contract-errors-and-safe-logging.md) |

## Summary

The backend now answers every failed request in one format (RFC 9457 problem+json from a type registry), publishes its API as a generated `openapi.json` that drives generated TypeScript types, and keeps Caregiver and AI free text out of the logs. The frontend gets an empty message catalog and a lint rule against string literals in JSX.

## Added

- `app.littlesteps.shared.web`: `ProblemTypes` (enum registry, `urn:littlesteps:problem:<slug>`), `ProblemExceptionHandler` (problem+json for all MVC errors, no exception messages, `requestId` member), `RequestIdFilter` (request ID in the logging context and `X-Request-Id`, one access line with the matched route pattern), `PingController` (`GET /api/v1/ping?count=1..10`), `OpenApiConfig`.
- `app.littlesteps.shared.text`: `CaregiverText` and `AiText`, `toString()` returns `[redacted]`, `reveal()` returns the content.
- springdoc 3.2.0 (API docs off by default, no Swagger UI), `backend/openapi.json`, and `OpenApiContractTests`, which writes `target/openapi.json` on every build and fails when it differs from the committed file.
- `frontend/scripts/api-types.sh` with `npm run api:types` and `npm run api:check` (`npx -p typescript@5.9.3 -p openapi-typescript@7.13.0`), generated `frontend/src/api/schema.d.ts`.
- `frontend/src/i18n/messages.ts` (empty catalog and `t()`), lint rule `react/jsx-no-literals` and `npm run lint:test`.

## Changed

- Logs are structured JSON (ECS) on stdout.
- `SpaFallbackConfig` no longer serves `index.html` for `/v3/...`.
- `App.tsx` takes the product name from a constant instead of a JSX literal.

## Fixed

Findings from the review pass (see the Review Triage Log in the spec): access line logs the route pattern, not the raw path; more problem types (401, 403, 409, 413, 503); stronger log and lint tests.

## Removed or deprecated

None.

## Security

PASS, no new warnings or exceptions; springdoc adds about 10 backend components. See [the security report](../security-reports/story-1-7-api-contract-errors-and-safe-logging.md).

## Operations impact

| Area | What changes (README is reviewed every story; write "reviewed, no change" if untouched) | README section |
|---|---|---|
| Setup | Reviewed, no change | Prerequisites, Setup |
| Development | New commands `lint:test`, `api:check`, `api:types`, `./mvnw test -Dopenapi.update=true`; new paragraph on the API contract, errors and logs | Development |
| Release | Reviewed, no change | Release |
| Deployment | Reviewed, no change (logs are now JSON on stdout) | Deployment |
| Layout | `openapi.json` noted | Layout |
| Versions | Reviewed, no change | Versions |

`docs/architecture.md` backend note updated.

## After you pull

Run `(cd frontend && npm ci)`. After any endpoint change run the two commands under "API contract, errors and logs" in the README. Story 1.6 (backend module skeleton) is built in parallel: expect textual merge conflicts in `backend/pom.xml` and `backend/src/main/resources/application.properties`, and add `@ApplicationModule` metadata to `shared` there.

## Tests

- Backend: `cd backend && ./mvnw verify`, 42 passed, 0 failed (new: value types 7, problem types 2, ping and problem responses 12, safe logging 8, OpenAPI drift 1, SPA 1; the other 11 are the existing tests).
- Negative tests: validation, 404, 405, 406, malformed body, 500, unsafe request ID, secrets absent from logs, stale `schema.d.ts` (checked manually: `api:check` exits 1).
- Frontend: `npm run build`, `npm run lint`, `npm run lint:test` (6 cases), `npm run api:check` all pass.

## Deferred and known issues

- [#79](https://github.com/yebbah/little-steps/issues/79) problem responses for container-level errors and security exceptions
- [#80](https://github.com/yebbah/little-steps/issues/80) document the real problem+json shape in openapi.json
- [#81](https://github.com/yebbah/little-steps/issues/81) lint rule for user-facing JSX props and string constants
- [#91](https://github.com/yebbah/little-steps/issues/91) error references in responses, detailed exceptions stored internally by reference (unhandled exceptions log the full stack trace until then)
- [#82](https://github.com/yebbah/little-steps/issues/82) request ID propagation to async work
- The lint rule is oxlint's `react/jsx-no-literals`, not ESLint (the repo uses oxlint).
