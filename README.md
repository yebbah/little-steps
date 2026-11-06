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
(cd backend && ./mvnw verify)                          # compile, tests (incl. the PWA fallback), backend SBOM
(cd frontend && npm ci && npm run build)               # type-check and bundle
(cd frontend && npm run lint)                          # oxlint
deploy/tests/security-scan.test.sh                     # tests for the security scan itself
deploy/check-images.sh                                 # compose.yaml and images.yaml must agree
deploy/tests/check-images.test.sh && deploy/tests/realm.test.sh   # tests for the image check and the Keycloak realm
deploy/tests/dev-scripts.test.sh                       # tests for dev-up.sh and dev-down.sh (stubs, no real Docker)
deploy/tests/check-urls.test.sh                        # tests for check-urls.sh (stub curl and nc)
shellcheck deploy/*.sh deploy/tests/*.sh    # brew install shellcheck
```

If a command fails with a Java error, `JAVA_HOME` is not a JDK 25. The build stops with "Java 25 is required".

**Security scan.** Every commit is scanned for leaked secrets and for vulnerable backend, frontend and image components. The blocking rule and exceptions are in [security/README.md](security/README.md).

```bash
deploy/security-scan.sh                   # run the scan by hand
deploy/security-scan.sh scan app-image    # scan the locally built app image (after dev-up.sh --full)
```

**Day-to-day development.** Run the backend from the IDE (port 8080) and the Vite dev server with `(cd frontend && npm run dev)`. Vite proxies `/api` and `/actuator` to `http://localhost:8080`, and hot reload works on both sides. Use `dev-up.sh --full` to check the product as it ships.

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

Production hosting is not available yet. What exists:

- **Local, full mode**: `deploy/dev-up.sh --full` builds `deploy/Dockerfile` (Node build of the PWA, Maven build of the jar with the PWA inside, then a Docker Hardened Images Java 25 JRE runtime running as the non-root user 65532) and runs it as the `app` service (compose profile `full`). Spring Boot serves the PWA at `/` and `/actuator/health` from one origin, and unknown non-API paths without a file extension return `index.html`. Roll back by stopping it with `deploy/dev-down.sh`.
- **Local, development mode**: infrastructure in Docker Compose with `deploy/dev-up.sh`, the backend run from the IDE and the Vite dev server proxying `/api` and `/actuator`.
- **Still planned**:
  - **Production hosting**: decided at launch. Every component is a standard container or protocol, so it can move to inexpensive hosting without code changes. All configuration and secrets come from the environment, through the Spring profiles `local`, `test` and `prod`.

When a deployment step exists, it is documented here with its commands, its configuration and how to roll back.

## Layout

```text
backend/            Spring Boot, Maven, root package app.littlesteps
frontend/           React + Vite PWA
content/            curated content YAML
eval/guardrails/    AI guardrail evaluation cases
deploy/             security scan, Docker Compose stack, image manifest (images.yaml), Keycloak realm, `dev-up.sh`, `dev-down.sh` and `check-urls.sh`, tests, and the app `Dockerfile`
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
