# LittleSteps

LittleSteps is a modular-monolith web app: a Spring Boot backend and a React PWA frontend, built to run end to end on a Mac with no paid services.

## Documentation

| What | Where | Written |
|---|---|---|
| Contributing policies | [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | branching, security gate, finishing a story or epic |
| Changelog | [docs/changelogs/](docs/changelogs/) | one per story, when the story is implemented |
| Security report | [docs/security-reports/](docs/security-reports/) | one per story, from the template |
| Release note | [docs/release-notes/](docs/release-notes/) | one per completed epic (Story 1.9) |
| Product and design specs | `.specs/` and `.ideas/` | planning and implementation specs |

This README is kept current: a story that changes how the project is set up, developed, released or deployed updates the matching section below, and says so in its changelog.

## Prerequisites

- **Java 25**: `brew install openjdk@25`, then set `JAVA_HOME` to it in your shell profile
- **Node 24** (pinned by `frontend/.nvmrc` and `engines` in `frontend/package.json`)
- **Maven**: no install needed, use the wrapper (`backend/mvnw`)
- **jq**: `brew install jq` (used by the security scan)
- **Docker Desktop**: needed from Story 1.3 (local infrastructure)

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
| One-command local stack (`dev-up.sh`, Docker Compose, Keycloak, PostgreSQL, Mailpit) | arrives with Stories 1.3 and 1.4; `dev-up.sh` will also enable the hook |
| Docker Hardened Images login (`docker login dhi.io`) | arrives with Story 1.3 |

## Development

**Build and test**

```bash
(cd backend && ./mvnw verify)                          # compile, tests, backend SBOM
(cd frontend && npm ci && npm run build)               # type-check and bundle
(cd frontend && npm run lint)                          # oxlint
deploy/tests/security-scan.test.sh                     # tests for the security scan itself
```

If a command fails with a Java error, `JAVA_HOME` is not a JDK 25. The build stops with "Java 25 is required".

**Security scan.** Every commit is scanned for leaked secrets and for vulnerable backend, frontend and image components. A finding in the CISA KEV catalog, or with a CVSS of 7.0 or more, blocks the commit.

```bash
deploy/security-scan.sh                   # run the scan by hand
```

**Never commit with `--no-verify`.** CI repeats the scan (Story 1.8), so a skipped hook still fails. Reports are written to `build/security/`; exceptions are described in `security/README.md`. The first run downloads the vulnerability database and the CISA KEV feed (cached for a day).

**Branches and commits**

- Work on a branch from an up-to-date `main`, named `feature/epic-<NN>-issue-<N>-<slug>` (Epic N is issue N+1).
- Commit messages are conventional (`feat:`, `fix:`, `docs:`, `chore:`) and reference the story issue.
- Pull requests are squash-merged. Never force-push a shared branch.
- Do not put personal data, secret values or absolute local paths in any file: the repository is public.

**Finishing a story.** Before a story's last commit:

1. Write its changelog in `docs/changelogs/` from the template, and add it to the index there.
2. Write its security report in `docs/security-reports/` from the template.
3. Update the Setup, Development, Release and Deployment sections of this README if the story changed any of them.

## Release

| Step | Status |
|---|---|
| Per story: changelog and security report committed with the story | in use |
| Per story: push the branch, close the story's issue with a short comment | in use |
| Per epic: release note in `docs/release-notes/` (summary, changes, integration, security, code quality, test results) | arrives with Story 1.9 (`deploy/release-notes.sh`) |
| Per epic: pull request from the epic branch, squash-merged to `main`, closes the epic issue | in use |
| Images and artifacts built and published by CI | arrives with Story 1.8 |

A release note links the changelogs and security reports of its stories, lists every active security exception, and lists images that do not come from Docker Hardened Images.

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
deploy/             security scan and tests; later Dockerfile, compose, image manifest, scripts
security/           vulnerability scan exceptions
.githooks/          git hooks (pre-commit runs the security scan)
docs/               changelogs, security reports, release notes
```

## Versions

The backend uses **Spring Boot 4.1.2**, the current GA line: Spring Boot 4.2 was still a release candidate when the repository was scaffolded, so the 4.1 set applies (Spring Modulith 2.1.x, Spring AI 2.0.x).
When Spring Boot 4.2 is GA, these move together: Spring Boot 4.2.x, Spring Modulith 2.2.x and Spring AI 2.1.x.
