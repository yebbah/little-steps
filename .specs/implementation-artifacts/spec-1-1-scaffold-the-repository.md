---
title: 'Story 1.1: Scaffold the repository'
type: 'chore'
created: '2026-11-06'
status: 'done'
baseline_commit: 'f6ffc3e07c9aec18258263e18e5fabc05e1b0121'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/little-steps/.specs/implementation-artifacts/epic-1-context.md'
  - '{project-root}/little-steps/.specs/planning-artifacts/epics/epic-01-local-environment.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The app repository holds only a README and the planning documents, so no later story has a project, toolchain or folder layout to build on.

**Approach:** Generate the backend from Spring Initializr and the frontend from the Vite `react-ts` starter, pin both to the versions in the architecture Stack table, add the supporting folders with short READMEs, and prove that both projects build.

## Boundaries & Constraints

**Always:**
- Spring Boot 4.1.2 (current GA; 4.2 is still RC, so the 4.1 set applies), Java 25, group `app.littlesteps`, artifact `littlesteps`, root package `app.littlesteps`. The README records why it is 4.1.2 and what moves together when 4.2 is GA.
- The Maven wrapper is on Maven 3.9.11 or later, so builds on JDK 25 show no native-access warning.
- `management.endpoint.health.show-details=never`.
- Initializr dependencies are limited to `web`, `actuator` and `validation`, so the app boots without a database. JPA, Flyway, Security, Modulith, Spring AI and springdoc arrive in the stories that need them (1.6, 1.7, Epic 3, Epic 13).
- Frontend: Vite `react-ts` template (the create-vite version used is recorded in `frontend/README.md`), Node pinned with `.nvmrc` and `engines` in `package.json`, `<html lang="en">` in `index.html`, React 19.3.1 and React DOM 19.3.1 pinned exactly, TypeScript 7.0.x as generated, vite-plugin-pwa 2.0.0 installed as a dev dependency but not configured yet (Epic 2).
- Commit both lockfiles (`backend` Maven wrapper files, `frontend/package-lock.json`).
- Supporting folders, each with a two-to-four-line `README.md` saying what lives there and which story fills it: `content/`, `eval/guardrails/`, `deploy/`, `security/`, `docs/release-notes/`.
- The root `README.md` names the prerequisites (Docker Desktop, Java 25 via `brew install openjdk@25`, Node 24 or later, Maven via the wrapper) and says setup steps arrive with Story 1.4.
- The root `.gitignore` covers `local.env`, `backend/target/`, `frontend/node_modules/`, `frontend/dist/`, `build/`, `build/security/`, the local storage folder `data/`, `.specs/party-mode/` (session memory, never published), and OS and IDE files.
- No personal data or absolute local paths in any file. The repository is public.

**Decisions (2026-11-06):**
- Java 25 is Homebrew `openjdk@25` (installed without sudo), with `JAVA_HOME` set in the shell profile. The setup docs recommend `brew install openjdk@25` rather than the Temurin cask, which needs an admin password.
- Implementation specs and the epic context live in `.specs/implementation-artifacts/` on the feature branch and ship in its PR. Planning documents change only on `docs/bmad-specs`.

- A `@SpringBootTest` health test asserts `/actuator/health` returns UP. This replaces the manual start-and-curl check.
- A wrong-JDK negative test is deferred to Story 1.8 (CI). Story 1.2's first scan covers Story 1.1's lockfiles.

**Never:**
- No application features, endpoints beyond the generated defaults, database, Docker or CI files (later stories own those).
- No version ranges for React or vite-plugin-pwa.
- No Python.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Backend build | `./mvnw verify` in `backend/` with JDK 25 | BUILD SUCCESS, the context-loads test passes | A JDK other than 25 fails fast with the enforcer message "Java 25 is required" |
| Frontend build | `npm ci && npm run build` in `frontend/` | `dist/` produced, typecheck passes | N/A |
| Backend boots | `@SpringBootTest` on a random port | `/actuator/health` returns status UP with no details | N/A |

</frozen-after-approval>

## Code Map

- `README.md` -- existing one-line title. Replace with the project intro, prerequisites, and folder map.
- `.specs/`, `.ideas/` -- planning documents. Do not modify in this story.
- `backend/` -- new. Initializr output (`pom.xml`, `mvnw`, `.mvn/`, `src/main/java/app/littlesteps/LittlestepsApplication.java`, `src/test/.../LittlestepsApplicationTests.java`, `application.properties`).
- `frontend/` -- new. Output of `npm create vite@latest frontend -- --template react-ts`.
- Toolchain -- JDK 25 is Homebrew `openjdk@25`. A non-interactive shell may still resolve JDK 17, so export `JAVA_HOME=/opt/homebrew/opt/openjdk@25/libexec/openjdk.jdk/Contents/Home` and prepend `$JAVA_HOME/bin` to `PATH` before any Maven command. Node 24 and npm are on `PATH`.
- Repository root for all paths in this spec is the git root `little-steps/` (the folder containing `.specs/`).

## Tasks & Acceptance

**Execution:**
- [x] `backend/` -- generate from `https://start.spring.io/starter.zip` (type `maven-project`, Boot 4.1.2, Java 25, the three dependencies) and unzip -- agreed starter.
- [x] `backend/pom.xml` -- add `maven-enforcer-plugin` requiring Java 25 -- fails fast on the wrong JDK.
- [x] `backend/src/main/resources/application.properties` -- set `spring.application.name=littlesteps`, expose only the `health` actuator endpoint, `show-details=never` -- minimal, safe default.
- [x] `backend/.mvn/wrapper/maven-wrapper.properties` -- Maven 3.9.11 or later -- clean JDK 25 builds.
- [x] `backend/src/test/java/app/littlesteps/HealthEndpointTests.java` -- `@SpringBootTest(webEnvironment = RANDOM_PORT)` asserting UP and no `components` or `details` -- automated positive test.
- [x] `frontend/` -- scaffold with create-vite `react-ts` (record its version), add `.nvmrc` (24) and `engines.node` `>=24 <25`, set `<html lang="en">`, pin `react` and `react-dom` to 19.3.1, add `vite-plugin-pwa@2.0.0` as a dev dependency, set the page title to "LittleSteps", and run `npm install` to refresh the lockfile -- agreed starter and pinned versions.
- [x] `content/README.md`, `eval/guardrails/README.md`, `deploy/README.md`, `security/README.md`, `docs/release-notes/README.md` -- create -- layout that later stories fill.
- [x] `README.md`, `.gitignore` -- write -- prerequisites, layout and ignore rules.

**Acceptance Criteria:**
- Given a fresh clone with JDK 25 and Node 24, when `./mvnw verify` and `npm ci && npm run build` run, then both succeed with no warnings about unpinned React versions.
- Given the repository, when it is listed, then the top level shows `backend/`, `frontend/`, `content/`, `eval/`, `deploy/`, `security/`, `docs/`, `README.md` and `.gitignore`, and no ignored build output is tracked.

## Implementation Notes

- Generated with Spring Initializr (Boot 4.1.2, Java 25), which names the web starter `spring-boot-starter-webmvc` and adds per-starter `*-test` dependencies. `HELP.md` and the empty `static/` and `templates/` folders were removed.
- The wrapper uses Maven 3.10.0 (script-only). It meets the 3.9.11-or-later rule, and builds show no native-access warning.
- `show-components=never` was added alongside `show-details=never`.
- `HealthEndpointTests` uses Boot 4's `RestTestClient`.
- Frontend generated by create-vite 9.3.4, which resolved TypeScript 7.0.2 and Vite 8.3.6. The template ships **oxlint**, not ESLint. Story 1.7's "ESLint rule flags string literals in JSX" must use oxlint or add ESLint for that rule; decide in the 1.7 spec.
- The Vite demo page (counter, community links) is left in place. Epic 2 replaces the UI.
- Verified on JDK 25: `./mvnw -q verify` passes with 2 tests and 0 failures. On JDK 17, the enforcer stops with "Java 25 is required".
- `npm audit`: 2 low and 4 moderate findings in glob and minimatch, which come in through vite-plugin-pwa 2.0.0 and workbox-build. None is High, Critical or in KEV. Story 1.2's first scan will report them.

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Evidence / route |
|---|-------|---------|---------|------------------|
| 1 | verification-gap | No test pins health-only actuator exposure | medium | Pre-verified: widening exposure keeps the suite green. Patch: assert `/actuator/env` and `/actuator/beans` return 404. |
| 2 | blind | Health test doesn't check other endpoints are closed | medium | Same root cause as #1. Patch (grouped). |
| 3 | edge, blind | README build block runs `cd frontend` from inside `backend/` | low | A single-shell run fails. Direct correction with subshells. Patch. |
| 4 | edge, blind | README says "Node 24 or later" but engines is `>=24 <25` | low | Contradicts the pin. Direct correction. Patch. |
| 5 | edge, blind | Unanchored `build/` and `data/` in the root .gitignore | medium | A future `data` package or `src/build` would be silently ignored. Patch: `/build/`, `/data/`. |
| 6 | blind | Only `local.env` is ignored, but env files arrive in Story 1.3 | low | Real secret-commit risk with a one-line fix. Patch: ignore `*.env`, keep `!*.env.example`. |
| 7 | blind | Vite demo page presents Vite's community links as the product's | low | It ships in the Story 1.5 image and on localhost. Direct correction: a minimal LittleSteps page, with demo CSS and assets deleted. Patch. |
| 8 | blind | Empty Initializr placeholders in pom.xml | low | Deletion plus a description. Patch. |
| 9 | blind | Frontend package name is `frontend` | low | Trivial rename to `littlesteps-frontend`. Patch. |
| 10 | blind | package-lock.json missing | false | The file exists and is staged. The review diff excluded it on purpose. |
| 11 | blind | mvnw scripts missing | false | `backend/mvnw` exists with mode 100755. The review diff excluded it on purpose. |
| 12 | blind | Frontend assets missing | false | `src/assets/*` and `public/*.svg` exist. The review diff excluded them on purpose. |
| 13 | blind | No frontend test runner | false | Vitest is planned in Story 1.8's acceptance criteria. Not a defect of this story. |
| 14 | blind | `requireMavenVersion` missing | low | Rejected: the wrapper pins Maven, and the fix adds a rule for a path nobody uses in practice. |
| 15 | blind | No PWA metadata in index.html | false | vite-plugin-pwa configuration is Epic 2 (Story 2.8) by intent. |
| 16 | blind | No jsx-a11y lint rules | false | The accessibility harness is Epic 2 (Story 2.7) by intent. |
| 17 | edge | Non-null assertion on `#root` in main.tsx | false | The template fails loudly if index.html changes, which is correct behavior and not reachable today. |

## Verification

**Commands:**
- `cd backend && ./mvnw -q verify` -- expected: exit 0
- `cd frontend && npm ci && npm run build` -- expected: exit 0, `dist/index.html` present
- `git status --short --ignored` -- expected: `target/`, `node_modules/` and `dist/` listed as ignored only
