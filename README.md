# LittleSteps

LittleSteps is a modular-monolith web app: a Spring Boot backend and a React PWA frontend, built to run end to end on a Mac with no paid services.

## Prerequisites

- **Docker Desktop**
- **Java 25**: `brew install openjdk@25`, then set `JAVA_HOME` to it in your shell profile
- **Node 24** (pinned by `frontend/.nvmrc` and `engines` in `frontend/package.json`)
- **Maven**: no install needed, use the wrapper (`backend/mvnw`)

Setup steps arrive with Story 1.4 (start and stop scripts).

## Security scan before every commit

Every commit is scanned for leaked secrets and for vulnerable backend, frontend and image components. A finding in the CISA KEV catalog, or with a CVSS of 7.0 or more, blocks the commit.

```bash
deploy/security-scan.sh install-tools          # once: pinned, checksum-verified tools
git config core.hooksPath .githooks            # enable the pre-commit hook (Story 1.4's dev-up.sh will do this)
deploy/security-scan.sh                        # run the scan by hand
```

**Never commit with `--no-verify`.** CI repeats the scan (Story 1.8), so a skipped hook still fails. Reports are written to `build/security/`; exceptions are described in `security/README.md`. The scan needs `jq` and a JDK 25 for the backend SBOM, and downloads the vulnerability database and the KEV feed (cached) the first time.

## Build

```bash
(cd backend && ./mvnw verify)
(cd frontend && npm ci && npm run build)
```

## Layout

```text
backend/            Spring Boot, Maven, root package app.littlesteps
frontend/           React + Vite PWA
content/            curated content YAML
eval/guardrails/    AI guardrail evaluation cases
deploy/             Dockerfile, compose, image manifest, env examples, scripts
security/           vulnerability scan exceptions
.githooks/          git hooks (pre-commit runs the security scan)
docs/release-notes/ one release note per epic
```

## Versions

The backend uses **Spring Boot 4.1.2**, the current GA line: Spring Boot 4.2 was still a release candidate when the repository was scaffolded, so the 4.1 set applies (Spring Modulith 2.1.x, Spring AI 2.0.x).
When Spring Boot 4.2 is GA, these move together: Spring Boot 4.2.x, Spring Modulith 2.2.x and Spring AI 2.1.x.
