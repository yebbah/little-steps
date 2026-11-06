# LittleSteps

[![CI](https://github.com/yebbah/little-steps/actions/workflows/ci.yml/badge.svg)](https://github.com/yebbah/little-steps/actions/workflows/ci.yml)

LittleSteps is a modular-monolith web app: a Spring Boot backend and a React PWA frontend, built to run end to end on a Mac with no paid services.

## Documentation

| What | Where | Written |
|---|---|---|
| Continuous integration | [Continuous integration](#continuous-integration) below | jobs, secrets, artifacts, local equivalents |
| Contributing policies | [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | spec first, branching, security gate, finishing a story or epic |
| Workflow decision trees | [docs/workflow.md](docs/workflow.md) | spec first, story lifecycle, triage, security finding, CI, deferred items, epic finish, issue hierarchy |
| Architecture diagrams | [docs/architecture.md](docs/architecture.md) | infrastructure (local and cloud) and components |
| Deferred items process | [docs/deferred-items.md](docs/deferred-items.md) | issues, target dates, exceptions |
| Changelog | [docs/changelogs/](docs/changelogs/) | one per story, when the story is implemented |
| Security report | [docs/security-reports/](docs/security-reports/) | one per story, from the template |
| Release note | [docs/release-notes/](docs/release-notes/) | one per completed epic (Story 1.9) |
| Product and design specs | `.specs/` and `.ideas/` | planning and implementation specs |

This README is reviewed and updated in every story, and the changelog records what was touched (or "reviewed, no change").

## Prerequisites

- **Java 25**: `brew install openjdk@25`, then set `JAVA_HOME` to it in your shell profile
- **Node 24** (pinned by `frontend/.nvmrc` and `engines` in `frontend/package.json`)
- **Maven**: no install needed, use the wrapper (`backend/mvnw`)
- **jq**: `brew install jq` (used by the security scan)
- **Docker Desktop**: runs the local stack (PostgreSQL, Keycloak, Mailpit)
- **A Docker Hardened Images account**: `docker login dhi.io` is needed to pull the PostgreSQL and Keycloak images; `dev-up.sh` checks it

## Setup

First-time setup, after cloning and installing the prerequisites above:

```bash
deploy/security-scan.sh install-tools     # pinned, checksum-verified Grype, Syft and gitleaks, into .tools/
docker login dhi.io                       # Docker Hardened Images account
(cd frontend && npm ci)                   # frontend dependencies
deploy/dev-up.sh                          # checks prerequisites, enables the git hook, starts the stack
deploy/dev-up.sh --full                   # same, plus builds and runs the app image (the product as it ships)
```

`deploy/dev-up.sh` works from any directory. It checks every prerequisite first and prints one fix step for anything missing, before changing anything. Then it sets `git config core.hooksPath .githooks` (the pre-commit security scan), checks Ollama, creates `deploy/local.env` from the example if it is missing (change the placeholder values when you like), starts PostgreSQL, Keycloak and Mailpit and waits until they are healthy. Running it again while the stack is up changes nothing and reports the state; with `--full` it also rebuilds the image (cached layers are reused) and checks the app's health again.

With `--full` it also builds `deploy/Dockerfile` (Docker reuses the layer cache), runs the app on the compose network with the `local` Spring profile on `http://localhost:8080` (change with `LS_APP_PORT` in `deploy/local.env`), and waits until `/actuator/health` reports UP. A failed build shows the build output and starts nothing; an app that never reports UP is named and the script exits non-zero. `dev-down.sh` stops the app too.

```bash
deploy/dev-down.sh                        # stop the containers; volumes and the local data/ folder are kept
deploy/dev-down.sh --wipe                 # reset: asks you to type "wipe", then removes containers, volumes and data/
deploy/dev-down.sh --wipe --yes           # same without the prompt
```

| Step | Status |
|---|---|
| Start, stop and reset (`dev-up.sh`, `dev-down.sh`; details and the realm reset in `deploy/README.md`) | available |
| Ollama (optional): while `LS_AI_REQUIRED=false` in `deploy/local.env` (the default) a missing Ollama or `OLLAMA_MODEL` is only a warning; when it is `true`, run `ollama pull <model>` first | available |
| Optional, phone access over Tailscale: install Tailscale and log in, then set `LS_TAILSCALE_HOST` in `deploy/local.env` to your machine's `<machine>.<tailnet>.ts.net` name (it feeds the realm redirect URI; reset the realm with `dev-down.sh --wipe` if the stack already ran). Then see "Open the app on your phone" below | optional |
| Known issue: 16 Keycloak 26.8.2 CVEs with no upstream fix are covered by written exceptions that expire 2026-12-04 (tracked in issue #56) | replace the Keycloak digest in `deploy/images.yaml` and `deploy/compose.yaml` when DHI publishes a newer one; see `security/exceptions.yaml` |

**Local URLs to test** (ports come from `deploy/local.env`; defaults shown). `dev-up.sh` prints the same list, and `deploy/check-urls.sh` requests all of them for you and prints PASS or FAIL per URL (the app on 8080 is informational: reported as running when it answers).

| What | URL | Expect |
|---|---|---|
| Keycloak admin console | http://localhost:8180/admin | login page; admin user and password from `local.env` |
| Keycloak realm metadata | http://localhost:8180/realms/littlesteps/.well-known/openid-configuration | JSON with issuer `.../realms/littlesteps` |
| Keycloak account console (test user login) | http://localhost:8180/realms/littlesteps/account | login for a fictional realm user |
| Mailpit inbox | http://localhost:8025 | empty inbox UI |
| Mailpit API | http://localhost:8025/api/v1/info | JSON with version |
| PostgreSQL (not HTTP) | `psql -h localhost -p 5432 -U littlesteps littlesteps` | connects (password from `local.env`) |
| App (only with `dev-up.sh --full`, or the backend run from the IDE) | http://localhost:8080 | the PWA; `/actuator/health` answers `{"status":"UP"}`; a deep link such as `/children/1` returns the same page |

**Open the app on your phone (Tailscale HTTPS).** A phone needs HTTPS for the PWA to install, and Tailscale provides it.

1. Install Tailscale on the Mac and the phone, log in to the same tailnet, and enable MagicDNS and HTTPS certificates for the tailnet in the Tailscale admin console.
2. Set `LS_TAILSCALE_HOST` in `deploy/local.env` to the Mac's `<machine>.<tailnet>.ts.net` name (reset the realm with `dev-down.sh --wipe` if the stack already ran).
3. Run `deploy/dev-up.sh --full`. If `tailscale` is installed and logged in, it prints the command and the HTTPS URL, for example `tailscale serve --bg --https=443 http://localhost:8080`.
4. Run that command once on the Mac, then open `https://<machine>.<tailnet>.ts.net` on the phone. Stop sharing with `tailscale serve --https=443 off`.

The phone cannot reach Keycloak on `localhost:8180` (that address is the phone itself), so signing in over Tailscale arrives with the authentication stories; until then the phone shows the app shell only.

## Development

**Build and test**

```bash
(cd backend && ./mvnw verify)                          # compile, tests (module boundaries, PWA fallback, problem responses, safe logging, OpenAPI drift, real PostgreSQL via Testcontainers; needs Docker), JaCoCo coverage, backend SBOM
(cd frontend && npm ci && npm run build)               # type-check and bundle
(cd frontend && npm run lint && npm run typecheck)     # oxlint (including the rule against string literals in JSX), tsc
(cd frontend && npm run lint:test)                     # tests for that lint rule
(cd frontend && npm run api:check)                     # fails when src/api/schema.d.ts is out of date
(cd frontend && npm run test:coverage)                 # Vitest with coverage (frontend/coverage/)
(cd frontend && npm run test:e2e:install && npm run test:e2e)  # Playwright and axe against a test-mode build with the gallery on (first run downloads Chromium); see frontend/e2e/README.md
deploy/check-actions.sh                                # every GitHub Action pinned to a commit SHA
deploy/tests/check-actions.test.sh                     # tests for that check
deploy/tests/security-scan.test.sh                     # tests for the security scan itself
deploy/check-images.sh                                 # compose.yaml and images.yaml must agree
deploy/tests/check-images.test.sh && deploy/tests/realm.test.sh   # tests for the image check and the Keycloak realm
deploy/tests/dev-scripts.test.sh                       # tests for dev-up.sh and dev-down.sh (stubs, no real Docker)
deploy/tests/check-urls.test.sh                        # tests for check-urls.sh (stub curl and nc)
shellcheck deploy/*.sh deploy/tests/*.sh .githooks/*    # brew install shellcheck
```

If a command fails with a Java error, `JAVA_HOME` is not a JDK 25. The build stops with "Java 25 is required".

**Security scan.** Every commit is scanned for leaked secrets and for vulnerable backend, frontend and image components. The blocking rule and exceptions are in [security/README.md](security/README.md).

```bash
deploy/security-scan.sh                   # run the scan by hand
deploy/security-scan.sh scan app-image    # scan the locally built app image (after dev-up.sh --full)
```

**Backend modules and database.** The backend is split into the modules of the architecture's dependency graph (AD-1): one package per module under `app.littlesteps`, each with `api`, `web`, `domain` and `persistence` sub-packages. `ModularityTests` fails the build when a module crosses its allowed dependencies, and writes the module diagrams to `backend/target/spring-modulith-docs/`. The `import` module's package is `importer`, because `import` is a Java keyword. Flyway reads `backend/src/main/resources/db/migration/<module>/` (one history, timestamped versions). Tests that need the application extend `IntegrationTest`, which starts PostgreSQL in Testcontainers from the image digest in `deploy/images.yaml`; no test uses H2. Tables without a Family are listed in [backend/GLOBAL_TABLES.md](backend/GLOBAL_TABLES.md).

**API contract, errors and logs.** The REST API lives under `/api/v1`. Every failed request is an RFC 9457 `application/problem+json` response whose `type` comes from `shared/web/ProblemTypes` and which carries a `requestId` (also sent as the `X-Request-Id` header; a safe incoming value is kept). Logs are JSON on stdout with the request ID, and hold IDs, enums, durations and counts only: wrap Caregiver and AI free text in `CaregiverText` or `AiText` (their `toString()` is `[redacted]`). `backend/openapi.json` is the committed contract; the backend build fails when the generated one differs. After changing an endpoint:

```bash
(cd backend && ./mvnw test -Dopenapi.update=true)      # refresh backend/openapi.json (not allowed in CI)
(cd frontend && npm run api:types)                     # regenerate frontend/src/api/schema.d.ts (needs network the first time)
```

The frontend has no hand-written API types and no inline UI text: sentences go in `frontend/src/i18n/messages.ts`.

**Day-to-day development.** The backend reads all its configuration from the environment and has no datasource unless a profile supplies one. Run it from the IDE (port 8080) with `SPRING_PROFILES_ACTIVE=local` and the variables of `deploy/local.env` exported (`LS_POSTGRES_DB`, `LS_POSTGRES_USER`, `LS_POSTGRES_PASSWORD`, and `LS_POSTGRES_PORT` if it is not 5432), after `deploy/dev-up.sh`. The `prod` profile takes `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD`. Run the Vite dev server with `(cd frontend && npm run dev)`. Vite proxies `/api` and `/actuator` to `http://localhost:8080`, and hot reload works on both sides. Use `dev-up.sh --full` to check the product as it ships.

Reports are written to `build/security/`. The first run downloads the vulnerability database and the CISA KEV feed (cached for a day). CI repeats the scan (see "Continuous integration").

**Branches, commits and finishing a story.** The rules are in [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request, on free GitHub-hosted runners, in four parallel jobs. A failing step is named in the run, so the name says what failed.

| Job | Runs |
|---|---|
| Backend | `./mvnw verify`: all tests, JaCoCo coverage, SBOM. Tests tagged `guardrail-eval` are excluded by default (wired up in Epic 13) |
| Frontend | `npm ci`, lint, typecheck, Vitest with coverage, build, then the OpenAPI type drift check (`api:check`) |
| Scripts | `deploy/check-actions.sh` (every action pinned to a commit SHA, version in a comment), `shellcheck` on `deploy/*.sh`, `deploy/tests/*.sh` and `.githooks/*`, `deploy/check-images.sh`, and the tests of the check scripts |
| Security | `deploy/security-scan.sh secrets` (commit history), `scan backend` and `scan frontend`; same KEV or CVSS 7.0+ rule as the hook. Image scans (`scan images`, `scan app-image`) are not in CI: run them by hand before a release (tracked in #95) |

- **Secrets to add once** (Settings, Secrets and variables, Actions): `DHI_USERNAME` and `DHI_TOKEN`, a Docker Hardened Images account, used for `docker login dhi.io` in the Backend job, because the integration tests pull the PostgreSQL image. Without them the Backend job fails at that step and says so. Pull requests from forks never receive secrets.
- **Build artifacts** (30 days): `backend-reports` (surefire, JaCoCo, SBOM), `frontend-reports` (coverage) and `security-reports` (summary, report.json, Grype reports); they feed the epic release note.
- **Caches**: Maven and npm (by the setup actions) and the Grype vulnerability database. The pinned scan tools and the KEV feed are fetched and verified every run, never cached.
- **Adding or updating an action**: pin it to the full commit SHA of the release (`gh api repos/<owner>/<repo>/commits/<tag> -q .sha`) and put the version in a comment after it. `deploy/check-actions.sh` fails on a tag or branch.
- **Run the same checks locally**: the commands under "Development" above; the Security job is `deploy/security-scan.sh secrets`, `scan backend` and `scan frontend`; add `deploy/security-scan.sh scan images` and `scan app-image` for the image scans CI does not run.
- **Branch protection** is a repository setting, not code. `main` requires a pull request and the four CI jobs (Backend, Frontend, Scripts, Security) before merge; the repository owner can still bypass it in an emergency. Change it under Settings, Branches.

## Release

How a story or epic is finished is in [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md). What exists today:

| Step | Status |
|---|---|
| Per story: changelog and security report, pull request squash-merged to `main` | in use |
| Per epic: release note in `docs/release-notes/`, generated by `deploy/release-notes.sh <epic>`, then tag `epic-NN` | in use (steps in [docs/release-notes/README.md](docs/release-notes/README.md)) |
| Scan reports uploaded as build artifacts by CI (app image build and image scans are manual, #95) | in use (see "Continuous integration") |
| Publishing images or artifacts | not available yet; CI never pushes an image |

## Deployment

Production hosting is not available yet. What exists:

- **Local, full mode**: `deploy/dev-up.sh --full` builds `deploy/Dockerfile` (Node build of the PWA, Maven build of the jar with the PWA inside, then a Docker Hardened Images Java 25 JRE runtime running as the non-root user 65532) and runs it as the `app` service (compose profile `full`). Spring Boot serves the PWA at `/` and `/actuator/health` from one origin, and unknown non-API paths without a file extension return `index.html`. Roll back by stopping it with `deploy/dev-down.sh`.
- **Local, development mode**: infrastructure in Docker Compose with `deploy/dev-up.sh`, the backend run from the IDE and the Vite dev server proxying `/api` and `/actuator`.
- **Still planned**:
  - **Production hosting**: decided at launch. Every component is a standard container or protocol, so it can move to inexpensive hosting without code changes. All configuration and secrets come from the environment, through the Spring profiles `local`, `test` and `prod`.

When a deployment step exists, it is documented here with its commands, its configuration and how to roll back.

## Layout

```text
backend/            Spring Boot, Maven, root package app.littlesteps, one package per module (AD-1), Flyway migrations in db/migration/<module>/ (backend/openapi.json is the generated API contract)
frontend/           React + Vite PWA
content/            curated content YAML
eval/guardrails/    AI guardrail evaluation cases
deploy/             security scan, Docker Compose stack, image manifest (images.yaml), Keycloak realm, `dev-up.sh`, `dev-down.sh`, `check-urls.sh` and `release-notes.sh`, tests, and the app `Dockerfile`
security/           vulnerability scan exceptions
.githooks/          git hooks (pre-commit runs the security scan)
.github/            issue templates (deferred items) and the CI workflow (workflows/ci.yml)
.specs/, .ideas/    product and design specs, input brief and project context
.tools/             pinned scanners installed by the security scan (git-ignored)
build/              generated output, such as security reports (git-ignored)
data/               local storage folder, removed by `dev-down.sh --wipe` (git-ignored)
docs/               contributing policies, changelogs, security reports, release notes, deferred items process
AGENTS.md           instructions for AI coding agents (CLAUDE.md points to it)
```

## Versions

The backend uses **Spring Boot 4.1.2**, the current GA line: Spring Boot 4.2 was still a release candidate when the repository was scaffolded, so the 4.1 set applies (Spring Modulith 2.1.x, Spring AI 2.0.x).
When Spring Boot 4.2 is GA, these move together: Spring Boot 4.2.x, Spring Modulith 2.2.x and Spring AI 2.1.x.
