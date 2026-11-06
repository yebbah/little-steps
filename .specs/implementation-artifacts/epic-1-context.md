# Epic 1 Context: Local environment and project skeleton

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Give a developer a one-command local stack on a Mac and a skeleton app that builds, boots and passes CI, so every later epic starts from the same layout, versions, boundaries and safety rails. From the second story on, every commit is scanned for vulnerabilities and leaked secrets. Images come from Docker Hardened Images where the catalog has them, and the epic closes with its own release note.

## Stories

- Story 1.1: Scaffold the repository
- Story 1.2: Security scan before every commit
- Story 1.3: Hardened local infrastructure with Docker Compose
- Story 1.4: Start and stop scripts
- Story 1.5: Hardened app image and full mode
- Story 1.6: Backend module skeleton and persistence baseline
- Story 1.7: API contract, errors and safe logging
- Story 1.8: Continuous integration with security and quality gates
- Story 1.9: Release notes for each epic

## Requirements & Constraints

- **Platform and cost:**
  - The whole product runs end to end on a Mac with no paid services.
  - Every component is a standard container or protocol, so it can move to cheap hosting without code changes.
  - CI uses free GitHub-hosted runners only.
- **Vulnerability gate:**
  - A pre-commit hook and CI both run one scan script, and commits are never made with `--no-verify`.
  - The gate blocks any finding in the CISA KEV catalog, and any with CVSS 7.0 or above.
  - The only pass without a fix is when no fixed version exists. That needs a written exception with a reason, a mitigation and an expiry of at most 30 days, and every exception appears in the release note.
  - Staged changes are scanned for secrets.
- **Images:**
  - Use Docker Hardened Images (`dhi.io`, free, needs a Docker login) when available, pinned by digest and recorded in an image manifest.
  - Images from anywhere else are flagged as warnings in every release note.
- **Release note:** each completed epic gets one, covering summary, features, changes, integration notes, security, code quality and test results (the new positive and negative tests plus the full non-regression suite).
- **Privacy:**
  - Logs never contain child content or identifiers.
  - Repository artifacts contain no personal data, and the repository is public.
- **Language:** user-facing text lives in message catalogs, never inline in code.
- **Local tooling:** the developer is a Java person and doesn't use Python. Scripts are bash.

## Technical Decisions

- **Layout:**

  ```text
  backend/            Spring Boot, Maven, root package app.littlesteps
  frontend/           React + Vite PWA
  content/            curated content YAML
  eval/guardrails/
  deploy/             Dockerfile, compose.yaml, images.yaml, env examples, keycloak/, scripts
  .githooks/
  security/           exceptions.yaml
  docs/release-notes/
  ```

- **Stack:**
  - Java 25, Spring Boot 4.1.2, Spring Modulith 2.1.2, Spring AI 2.0.2. If Boot 4.2 is GA at scaffold time, move Boot 4.2.x, Modulith 2.2.x and Spring AI 2.1.x together.
  - PostgreSQL 18, Keycloak 26.8.1, Mailpit.
  - React 19.3.1, Vite 8, vite-plugin-pwa 2.0.0, TypeScript 7.0.x.
  - openapi-typescript 7.13.0, run with its own TypeScript 5.9.3.
  - Testcontainers 2.x (module names changed).
  - Grype, Syft and gitleaks, pinned and checksum-verified. Not Trivy: it suffered a supply-chain compromise in 2026.
- **Starters:** Spring Initializr for the backend, and `npm create vite@latest` with the `react-ts` template plus vite-plugin-pwa for the frontend.
- **Modular monolith:**
  - Modules: `shared`, then the feature modules `family`, `child`, `careteam`, `goals`, `library`, `practice`, `planning`, `progress`, `summary`, `import`, then the platform modules `ai`, `notifications`, `audit`, `privacy`, `metrics`.
  - Allowed edges:
    - `child`, `careteam` → `family`
    - `goals` → `careteam`, `child`
    - `library` → `goals`, `child`, `ai`
    - `practice` → `goals`, `library`, `careteam`
    - `planning` → `goals`, `library`, `practice`
    - `progress` → `practice`, `goals`, `ai`
    - `summary` → `progress`, `goals`, `careteam`, `ai`
    - `import` → `goals`, `library`, `ai`
    - every module → `shared`
    - platform modules depend on `shared` only
  - `ApplicationModules.verify()` runs in CI.
  - Cross-module events use `@ApplicationModuleListener` with the JPA event publication registry.
- **Persistence:**
  - One Flyway history, with files in `db/migration/<module>/` and timestamped, forward-only versions.
  - Tests use Testcontainers PostgreSQL, never H2.
  - Each story creates only the tables it needs. Epic 1 creates none.
- **API:**
  - REST JSON under `/api/v1`.
  - Errors are RFC 9457 problem+json, with types from one registry in `shared/web`.
  - springdoc generates the OpenAPI document, the frontend generates its types from it, and a drift check enforces this.
- **Logging:** free text is held in `CaregiverText` and `AiText` types whose `toString` prints `[redacted]`. Logs are structured JSON with IDs only, never bodies.
- **Config:** Spring profiles `local`, `test` and `prod`, with all configuration and secrets from the environment.
- **Deployable:**
  - One app image, in which Spring Boot serves the built PWA at the same origin as `/api`. It runs as a non-root user on a DHI JRE runtime.
  - Locally, the app runs from the IDE and the Vite dev server proxies `/api`.
  - Ollama runs natively on the host, and is optional until Epic 13 (`LS_AI_REQUIRED=false`).
- **Keycloak realm `littlesteps`:** a public client `littlesteps-pwa` with PKCE S256 and rotating refresh tokens, two fictional local test users, and mail sent to Mailpit.
- **Supply chain:** GitHub Actions are pinned to full commit SHAs.

## Cross-Story Dependencies

- Story 1.1's lockfiles are what 1.2 scans.
- The image manifest from 1.3 extends 1.2's scan to images.
- 1.4's `dev-up.sh` enables the git hook from 1.2 and checks the `dhi.io` login.
- 1.5 reuses 1.3's manifest and digests. 1.6's Testcontainers uses the same PostgreSQL digest.
- 1.8 runs everything from 1.1–1.7 in CI.
- 1.9 consumes the scan, coverage and test reports from 1.2 and 1.8.
- Tenancy, sign-in and the client outbox are deferred to Epic 3.
