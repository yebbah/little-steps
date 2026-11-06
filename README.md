# LittleSteps

LittleSteps is a modular-monolith web app: a Spring Boot backend and a React PWA frontend, built to run end to end on a Mac with no paid services.

## Documentation

| What | Where | Written |
|---|---|---|
| Contributing policies | [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | branching, security gate, finishing a story or epic |
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
```

`deploy/dev-up.sh` works from any directory. It checks every prerequisite first and prints one fix step for anything missing, before changing anything. Then it sets `git config core.hooksPath .githooks` (the pre-commit security scan), checks Ollama, creates `deploy/local.env` from the example if it is missing (change the placeholder values when you like), starts PostgreSQL, Keycloak and Mailpit and waits until they are healthy. Running it again while the stack is up only reports the state.

```bash
deploy/dev-down.sh                        # stop the containers; volumes and the local data/ folder are kept
deploy/dev-down.sh --wipe                 # reset: asks you to type "wipe", then removes containers, volumes and data/
deploy/dev-down.sh --wipe --yes           # same without the prompt
```

| Step | Status |
|---|---|
| Start, stop and reset (`dev-up.sh`, `dev-down.sh`; details and the realm reset in `deploy/README.md`) | available |
| Ollama (optional): while `LS_AI_REQUIRED=false` in `deploy/local.env` (the default) a missing Ollama or `OLLAMA_MODEL` is only a warning; when it is `true`, run `ollama pull <model>` first | available |
| Optional, phone access over Tailscale: install Tailscale and log in, then set `LS_TAILSCALE_HOST` in `deploy/local.env` to your machine's `<machine>.<tailnet>.ts.net` name (it feeds the realm redirect URI; reset the realm with `dev-down.sh --wipe` if the stack already ran). The `tailscale serve` command and the app itself arrive with Story 1.5 | optional |
| Known issue: 16 Keycloak 26.8.2 CVEs with no upstream fix are covered by written exceptions that expire 2026-12-04 (tracked in issue #56) | replace the Keycloak digest in `deploy/images.yaml` and `deploy/compose.yaml` when DHI publishes a newer one; see `security/exceptions.yaml` |

**Local URLs to test** (ports come from `deploy/local.env`; defaults shown). `dev-up.sh` prints the same list, and `deploy/check-urls.sh` requests all of them for you and prints PASS or FAIL per URL (the app on 8080 is informational until Story 1.5).

| What | URL | Expect |
|---|---|---|
| Keycloak admin console | http://localhost:8180/admin | login page; admin user and password from `local.env` |
| Keycloak realm metadata | http://localhost:8180/realms/littlesteps/.well-known/openid-configuration | JSON with issuer `.../realms/littlesteps` |
| Keycloak account console (test user login) | http://localhost:8180/realms/littlesteps/account | login for a fictional realm user |
| Mailpit inbox | http://localhost:8025 | empty inbox UI |
| Mailpit API | http://localhost:8025/api/v1/info | JSON with version |
| PostgreSQL (not HTTP) | `psql -h localhost -p 5432 -U littlesteps littlesteps` | connects (password from `local.env`) |
| App (arrives with Story 1.5) | http://localhost:8080 | connection refused until then |

## Development

**Build and test**

```bash
(cd backend && ./mvnw verify)                          # compile, tests, backend SBOM
(cd frontend && npm ci && npm run build)               # type-check and bundle
(cd frontend && npm run lint)                          # oxlint
deploy/tests/security-scan.test.sh                     # tests for the security scan itself
deploy/check-images.sh                                 # compose.yaml and images.yaml must agree
deploy/tests/check-images.test.sh && deploy/tests/realm.test.sh   # tests for the image check and the Keycloak realm
deploy/tests/dev-scripts.test.sh                       # tests for dev-up.sh and dev-down.sh (stubs, no real Docker)
deploy/tests/check-urls.test.sh                        # tests for check-urls.sh (stub curl and nc)
shellcheck deploy/dev-up.sh deploy/dev-down.sh deploy/check-urls.sh deploy/tests/dev-scripts.test.sh deploy/tests/check-urls.test.sh   # brew install shellcheck
```

If a command fails with a Java error, `JAVA_HOME` is not a JDK 25. The build stops with "Java 25 is required".

**Security scan.** Every commit is scanned for leaked secrets and for vulnerable backend, frontend and image components. The blocking rule and exceptions are in [security/README.md](security/README.md).

```bash
deploy/security-scan.sh                   # run the scan by hand
```

Reports are written to `build/security/`. The first run downloads the vulnerability database and the CISA KEV feed (cached for a day). CI repeats the scan (Story 1.8).

**Branches, commits and finishing a story.** The rules are in [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

## Release

How a story or epic is finished is in [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md). What exists today:

| Step | Status |
|---|---|
| Per story: changelog and security report, pull request squash-merged to `main` | in use |
| Per epic: release note in `docs/release-notes/` | arrives with Story 1.9 (`deploy/release-notes.sh`) |
| Images and artifacts built and published by CI | arrives with Story 1.8 |

## Deployment

Not available yet. What is planned:

- **Local, full mode** (Story 1.5): one app image in which Spring Boot serves the built PWA at the same origin as `/api`, running as a non-root user on a Docker Hardened Images Java runtime.
- **Local, development mode**: infrastructure in Docker Compose, started with `deploy/dev-up.sh` (available); the backend run from the IDE and the Vite dev server proxying `/api` arrive with Story 1.5.
- **Production hosting**: decided at launch. Every component is a standard container or protocol, so it can move to inexpensive hosting without code changes. All configuration and secrets come from the environment, through the Spring profiles `local`, `test` and `prod`.

When a deployment step exists, it is documented here with its commands, its configuration and how to roll back.

## Layout

```text
backend/            Spring Boot, Maven, root package app.littlesteps
frontend/           React + Vite PWA
content/            curated content YAML
eval/guardrails/    AI guardrail evaluation cases
deploy/             security scan, Docker Compose stack, image manifest (images.yaml), Keycloak realm, `dev-up.sh`, `dev-down.sh` and `check-urls.sh`, tests; Dockerfile arrives with Story 1.5
security/           vulnerability scan exceptions
.githooks/          git hooks (pre-commit runs the security scan)
.github/            issue templates (deferred items); CI arrives with Story 1.8
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
