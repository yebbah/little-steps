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
- **A Docker Hardened Images account**: `docker login dhi.io` is needed to pull the PostgreSQL and Keycloak images

## Setup

Run once after cloning:

```bash
deploy/security-scan.sh install-tools     # pinned, checksum-verified Grype, Syft and gitleaks, into .tools/
git config core.hooksPath .githooks       # enable the pre-commit security scan
(cd frontend && npm ci)                   # frontend dependencies
```

Check the setup by building both projects (see Development).

| Step | Status |
|---|---|
| Tools, hook, dependencies (above) | available |
| Local stack with Docker Compose (PostgreSQL 18, Keycloak on port 8180, Mailpit): `cp deploy/local.env.example deploy/local.env`, change the placeholder values, then `docker compose --env-file deploy/local.env -f deploy/compose.yaml up -d --wait` (see `deploy/README.md`, including how to reset the realm) | available |
| One-command start and stop (`dev-up.sh`, `dev-down.sh`); `dev-up.sh` will also enable the hook | arrives with Story 1.4 |
| Docker Hardened Images login (`docker login dhi.io`), needed to pull the DHI images | required now; `dev-up.sh` will check it (Story 1.4) |
| Known issue: 16 Keycloak 26.8.2 CVEs with no upstream fix are covered by written exceptions that expire 2026-12-04 (tracked in issue #56) | replace the Keycloak digest in `deploy/images.yaml` and `deploy/compose.yaml` when DHI publishes a newer one; see `security/exceptions.yaml` |

## Development

**Build and test**

```bash
(cd backend && ./mvnw verify)                          # compile, tests, backend SBOM
(cd frontend && npm ci && npm run build)               # type-check and bundle
(cd frontend && npm run lint)                          # oxlint
deploy/tests/security-scan.test.sh                     # tests for the security scan itself
deploy/check-images.sh                                 # compose.yaml and images.yaml must agree
deploy/tests/check-images.test.sh && deploy/tests/realm.test.sh   # tests for the image check and the Keycloak realm
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
- **Local, development mode** (Stories 1.3 and 1.4): infrastructure in Docker Compose, the backend run from the IDE, and the Vite dev server proxying `/api`.
- **Production hosting**: decided at launch. Every component is a standard container or protocol, so it can move to inexpensive hosting without code changes. All configuration and secrets come from the environment, through the Spring profiles `local`, `test` and `prod`.

When a deployment step exists, it is documented here with its commands, its configuration and how to roll back.

## Layout

```text
backend/            Spring Boot, Maven, root package app.littlesteps
frontend/           React + Vite PWA
content/            curated content YAML
eval/guardrails/    AI guardrail evaluation cases
deploy/             security scan, Docker Compose stack, image manifest (images.yaml), Keycloak realm, tests; later Dockerfile and start/stop scripts
security/           vulnerability scan exceptions
.githooks/          git hooks (pre-commit runs the security scan)
.github/            issue templates (deferred items); CI arrives with Story 1.8
.specs/, .ideas/    product and design specs, input brief and project context
.tools/             pinned scanners installed by the security scan (git-ignored)
build/              generated output, such as security reports (git-ignored)
docs/               contributing policies, changelogs, security reports, release notes, deferred items process
AGENTS.md           instructions for AI coding agents (CLAUDE.md points to it)
```

## Versions

The backend uses **Spring Boot 4.1.2**, the current GA line: Spring Boot 4.2 was still a release candidate when the repository was scaffolded, so the 4.1 set applies (Spring Modulith 2.1.x, Spring AI 2.0.x).
When Spring Boot 4.2 is GA, these move together: Spring Boot 4.2.x, Spring Modulith 2.2.x and Spring AI 2.1.x.
