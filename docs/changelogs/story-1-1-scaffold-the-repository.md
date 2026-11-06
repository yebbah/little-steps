# Changelog: Story 1.1, Scaffold the repository

| | |
|---|---|
| Story | 1.1 |
| Epic | 1, Local environment and project skeleton |
| Branch | feature/epic-01-issue-2-local-environment |
| Commits | c771bf8 |
| Date | 2026-11-06 |
| Security report | None. Written retroactively for the story; the Story 1.2 scan covers its lockfiles ([report](../security-reports/story-1-2-security-scan-before-every-commit.md)). |

## Summary

The repository had only a README and the planning documents. This story adds the backend and frontend projects, pinned to the versions in the architecture, so every later story has a project and layout to build on.

## Added

- Backend: Spring Boot 4.1.2 on Java 25 (Maven wrapper), with the web, actuator and validation starters. Only `/actuator/health` is exposed, with no details. A Java 25 check in the build fails fast on any other JDK.
- Frontend: Vite `react-ts` app with React 19.3.1 and React DOM 19.3.1 pinned exactly, TypeScript 7.0, oxlint, and vite-plugin-pwa 2.0.0 installed but not configured.
- Folders with short READMEs: `content/`, `eval/guardrails/`, `deploy/`, `security/`, `docs/release-notes/`.
- Root README with prerequisites and layout, and a `.gitignore` covering env files, build output, local storage and session notes.
- Health endpoint tests that check status UP and that other actuator endpoints are closed.

## Changed

None.

## Fixed

- Review of the story tightened the `.gitignore` (anchored `/build/` and `/data/`, ignored `*.env` except examples), corrected the README build commands, and replaced the Vite demo page with a minimal LittleSteps page.

## Removed or deprecated

None.

## Security

No scan existed yet. The npm audit at the time showed 2 low and 4 moderate findings in glob and minimatch, through vite-plugin-pwa. None was High, Critical or in KEV.

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | JDK 25 and Node 24 are required | Setup |
| Development | `./mvnw verify` and `npm ci && npm run build` build both projects | Development |
| Release | No change | Release |
| Deployment | No change | Deployment |

## After you pull

Install JDK 25 (`brew install openjdk@25`) and Node 24, then build both projects.

## Tests

Two backend tests pass (context loads, health endpoint). The frontend build type-checks. No frontend test runner yet (Story 1.8).

## Deferred and known issues

- Wrong-JDK negative test: Story 1.8 (CI).
- The template ships oxlint, not ESLint; Story 1.7 decides how to enforce "no string literals in JSX".
