---
epic: 1
title: Local environment and project skeleton
status: approved
phase: P1
---

# Epic 1: Local environment and project skeleton

A developer can start and stop the whole product on a Mac with one command each. A skeleton app builds, boots and passes CI. From the second story on, every commit is security-scanned. Images come from Docker Hardened Images where possible, and the epic closes with its own release note.

**Done when:**
- `deploy/dev-up.sh` brings every service up healthy, and the skeleton app answers at `localhost` and over Tailscale HTTPS.
- `deploy/dev-down.sh --wipe` resets everything.
- A commit that adds a known-exploited dependency is blocked.
- CI is green.
- `docs/release-notes/epic-01-local-environment.md` is published.

## Requirements covered

- **FRs:** FR-19
- **NFRs:**
  - NFR-11 (runs on a Mac, portable)
  - NFR-15 (text kept out of code)
  - NFR-16 (no cost locally)
  - NFR-17 (logs without child content)
  - NFR-20 (vulnerability gate)
  - NFR-21 (hardened images)
  - NFR-22 (release notes)
- **Architecture:**
  - Starters and Stack table
  - AD-1 (module skeleton)
  - AD-19 (safe logging)
  - AD-20 (API contract, Flyway)
  - AD-22 (Dockerfile, compose, scripts)
  - AD-24 (Testcontainers)
  - AD-25 (security gate)
  - AD-26 (hardened images)
  - AD-27 (release notes)
- **Not in this epic:**
  - AD-2 tenancy and AD-3 sign-in come in Epic 3, with the first Family data.
  - AD-5 outbox and AD-23 data layer come with the first client writes, also in Epic 3.

## Stories

### Story 1.1: Scaffold the repository

As a developer,
I want the backend, frontend and supporting folders created from the agreed starters,
So that every later story starts from the same layout and versions.

**Acceptance Criteria:**

**Given** the app repository holding only its README and `.specs/`
**When** the scaffold is generated
**Then** the repository holds the following folders:
- `backend/`: Spring Initializr output with Spring Boot 4.1.2, Java 25 and Maven, root package `app.littlesteps`
- `frontend/`: Vite `react-ts` template with vite-plugin-pwa 2.0.0, React 19.3.1 and TypeScript 7.0.x
- `content/`, `eval/guardrails/`, `deploy/`, `security/` and `docs/release-notes/`, each with a short `README.md`

**And** dependency versions match the spine Stack table. If Spring Boot 4.2 is GA at scaffold time, Spring Boot 4.2.x, Spring Modulith 2.2.x and Spring AI 2.1.x are used together instead, and the change is noted in the README.
**And** `./mvnw verify` in `backend/` and `npm run build` in `frontend/` both succeed, and both lockfiles are committed.
**And** `.gitignore` excludes `local.env`, build outputs, `node_modules`, `build/security/` and the local storage folder.
**And** a root `README.md` names the prerequisites. The setup steps are filled in by Story 1.4.

### Story 1.2: Security scan before every commit

As a developer,
I want every commit scanned for vulnerable dependencies and leaked secrets,
So that a known-exploited or high-severity issue never enters the repository.

**Acceptance Criteria:**

**Given** `deploy/security-scan.sh` and `.githooks/pre-commit`
**When** a commit is attempted
**Then** the hook runs the scan and blocks the commit when any check fails:
- gitleaks on the staged changes
- Grype on a CycloneDX SBOM of the backend (the Maven plugin regenerates it only when `pom.xml` changed)
- Grype on the frontend's `package-lock.json`
- Grype on every image in `deploy/images.yaml`, once that manifest exists (Story 1.3)

**And** the blocking rule is: a finding whose CVE is in the CISA KEV catalog, or whose CVSS is 7.0 or above (High or Critical), fails the scan. The output shows the package, the CVE, the KEV flag, the CVSS, and the fixed version where one exists.
**And** the KEV feed is downloaded at most once a day and cached. With no cache and no network, the scan fails and says why.
**And** a CVE with no fixed version passes only if `security/exceptions.yaml` lists it with a reason, a mitigation and an expiry at most 30 days away. An expired or malformed entry fails the scan.
**And** reports are written to `build/security/` (JSON plus a short text summary) for the release note.
**And** Grype, Syft and gitleaks versions are pinned in the script and their checksums verified. A missing tool gives one install step.
**And** tests with fixture SBOMs prove that:
- a KEV finding blocks
- a CVSS 7.5 finding blocks
- a CVSS 5.0 finding that isn't in KEV passes, with a warning
- a valid exception passes
- an expired exception blocks
- a staged fake secret blocks

**And** the README states that commits are never made with `--no-verify`. CI repeats the scan (Story 1.8).

### Story 1.3: Hardened local infrastructure with Docker Compose

As a developer,
I want PostgreSQL, Keycloak and Mailpit defined in one compose file, using hardened images where they exist,
So that the same vetted services run the same way on every machine.

**Acceptance Criteria:**

**Given** `deploy/images.yaml`
**When** it is read
**Then** it lists every image with its name, source (`dhi` or `other`), tag and digest, plus a reason for each `other`:
- PostgreSQL 18 from `dhi.io` (`dhi`)
- Keycloak 26.8.1 from `quay.io/keycloak` (`other`: no DHI image)
- Mailpit (`other`: no DHI image, local only)

Before pinning, the story checks the live DHI catalog: any image that has become available there moves to `dhi`.

**Given** `deploy/compose.yaml` and `deploy/local.env.example`
**When** the services are started with docker compose
**Then** PostgreSQL (named volume), Keycloak (dev mode, its own schema) and Mailpit start and report healthy. Every image is referenced by the digest in `images.yaml`.
**And** Keycloak imports the `littlesteps` realm from `deploy/keycloak/littlesteps-realm.json`. The realm has:
- a public client `littlesteps-pwa` with PKCE (S256) and rotating refresh tokens
- redirect URIs for `http://localhost:5173`, `http://localhost:8080`, and a Tailscale host from env
- two fictional local-only users, `caregiver.a@example.test` and `caregiver.b@example.test`
- outgoing mail sent to Mailpit

**And** every port and credential comes from `local.env`, with defaults in the example file and no secrets committed.
**And** Presidio is a commented-out service marked "P2 (Epic 18)", already listed in `images.yaml` as `other`.
**And** the security scan now covers these images, and none has a blocking finding.
**And** a check script fails when an image reference in `compose.yaml` does not match `images.yaml`.

### Story 1.4: Start and stop scripts

As a developer,
I want `dev-up.sh` and `dev-down.sh` to manage the whole local stack,
So that starting, stopping and resetting are one command each.

**Acceptance Criteria:**

**Given** a Mac
**When** `deploy/dev-up.sh` runs
**Then** it checks every prerequisite and prints one fix step for anything missing, exiting non-zero before starting anything. The prerequisites are:
- Docker Desktop
- a `dhi.io` login
- Java 25
- Node
- Grype, Syft and gitleaks

**And** it sets `git config core.hooksPath .githooks`, so the pre-commit scan is active on every clone.
**And** it checks Ollama and `OLLAMA_MODEL`. These are a warning only while `LS_AI_REQUIRED=false` (the default until Epic 13), and an error with the `ollama pull` step otherwise.
**And** it creates `local.env` from the example if it is missing, starts the compose services, and waits until all are healthy. A timeout names the service that failed. It then prints the URLs for the app, Keycloak, Mailpit and the database.
**And** running it again while everything is up is harmless and reports the current state.

**Given** the stack is running
**When** `deploy/dev-down.sh` runs
**Then** all containers stop, and volumes and the local storage folder are kept.

**Given** the stack has data
**When** `deploy/dev-down.sh --wipe` runs
**Then** it asks for typed confirmation, then removes the containers, the volumes and the local storage folder. `--yes` skips the prompt.

**Given** the stack is up
**When** `deploy/check-urls.sh` runs
**Then** it requests every URL in the README "Local URLs to test" table (Keycloak admin console, realm metadata, account console, Mailpit inbox and API, the PostgreSQL port) with ports from `local.env`, and prints PASS or FAIL for each. The app on port 8080 is informational until Story 1.5. It exits non-zero if a required URL fails, and sends no credentials.

**And** all three scripts are bash, pass `shellcheck`, and work from any current directory.
**And** the README documents first-time setup using only these scripts, plus the optional Tailscale step.

### Story 1.5: Hardened app image and full mode

As a developer,
I want one hardened container image holding the built PWA and the Spring Boot app,
So that I can test the product exactly as it will ship, including from a phone.

**Acceptance Criteria:**

**Given** `deploy/Dockerfile`
**When** the image is built
**Then** the build stages use DHI images, digest-pinned and listed in `images.yaml`:
- a Node stage builds the frontend
- a JDK stage builds the jar with the static files inside
- a minimal DHI Java JRE runtime stage runs it as a non-root user

**And** the running app serves the PWA at `/` and health at `/actuator/health` from the same origin, and routes unknown non-API paths to `index.html`.
**And** the built image passes the security scan with no blocking findings.

**Given** the infrastructure is up
**When** `deploy/dev-up.sh --full` runs
**Then** it builds the image (reusing the cache), runs it on the compose network with profile `local`, and waits for `/actuator/health` to report UP.
**And** if `tailscale` is installed and logged in, it prints the `tailscale serve` command, and the README explains opening the app on a phone over Tailscale HTTPS.

**Given** day-to-day development
**When** the backend runs from the IDE and `npm run dev` runs Vite
**Then** Vite proxies `/api` and `/actuator` to `localhost:8080`, with hot reload on both sides.

### Story 1.6: Backend module skeleton and persistence baseline

As a developer,
I want the agreed modules, the boundary test, migrations and a real-database test base in place,
So that every feature story lands in the right module and fails CI if it crosses a boundary.

**Acceptance Criteria:**

**Given** the backend project
**When** the skeleton is added
**Then** there is one package under `app.littlesteps` for each module:
- `shared`
- feature modules: `family`, `child`, `careteam`, `goals`, `library`, `practice`, `planning`, `progress`, `summary`, `import`
- platform modules: `ai`, `notifications`, `audit`, `privacy`, `metrics`

**And** each module has a `package-info.java` declaring its allowed dependencies exactly as in the AD-1 graph, plus empty `api`, `web`, `domain` and `persistence` packages.
**And** `ModularityTests` runs `ApplicationModules.verify()` and generates the module documentation. A test fixture that adds a forbidden dependency makes it fail.
**And** cross-module events use `@ApplicationModuleListener` with the JPA event publication registry, which resubmits incomplete publications at startup.
**And** Flyway reads `db/migration/<module>/` with timestamped versions. The baseline migration creates nothing a later story owns.
**And** an `IntegrationTest` base class starts Testcontainers PostgreSQL from the same image digest as compose, using the Testcontainers 2.x module name. No test uses H2.
**And** the Spring profiles `local`, `test` and `prod` exist, all configuration comes from the environment, and `backend/GLOBAL_TABLES.md` exists, listing no tables yet.

### Story 1.7: API contract, errors and safe logging

As a developer,
I want one error format, a generated API contract and logs that can't leak child content,
So that frontend and backend stay in step and privacy holds from the first endpoint.

**Acceptance Criteria:**

**Given** the backend
**When** a request fails
**Then** the response is RFC 9457 `application/problem+json`, with `type` taken from `shared/web/ProblemTypes`. A sample `GET /api/v1/ping` and its tests cover a success and a problem response.

**Given** springdoc is configured
**When** the backend builds
**Then** `openapi.json` is generated. `npm run api:types` generates the TypeScript types with `npx -p typescript@5.9.3 -p openapi-typescript@7.13.0`, so the app stays on TypeScript 7.0.x.
**And** a check fails when the generated types are out of date.

**Given** the `shared` module
**When** free text from Caregivers or AI is handled
**Then** `CaregiverText` and `AiText` return `[redacted]` from `toString()`, with unit tests.
**And** logs are structured JSON on stdout with a request ID and no request or response bodies. A test asserts that logged `CaregiverText` content never appears in the output.
**And** the frontend has an empty message catalog, and an ESLint rule flags string literals in JSX.

### Story 1.8: Continuous integration with security and quality gates

As a developer,
I want every push checked automatically for build, boundary, security and quality problems,
So that nothing unsafe or broken reaches review, even if a local hook was skipped.

**Acceptance Criteria:**

**Given** `.github/workflows/ci.yml`
**When** a commit is pushed or a pull request opens
**Then** it runs:
- `./mvnw verify`, with `ModularityTests`, the Testcontainers tests and JaCoCo coverage
- `npm ci`, lint, typecheck, Vitest with coverage, and build in `frontend/`
- the OpenAPI type drift check
- `shellcheck` on `deploy/*.sh` and `.githooks/*`
- the `images.yaml` digest check
- a Docker build of the app image (not pushed)
- `deploy/security-scan.sh` over the repository and all images, failing on the same KEV or CVSS 7.0+ rule

**And** every third-party action is pinned to a full commit SHA, with the version in a comment. A check fails on any action referenced by tag.
**And** the workflow uses only free GitHub-hosted runners and caches Maven, npm and the vulnerability database.
**And** the security, coverage and test reports are uploaded as build artifacts for the release note.
**And** a failing step names what failed, and the README shows the status badge.
**And** the `guardrail-eval` tag is excluded by default. It is wired up in Epic 13.

### Story 1.9: Release notes for each epic

As a developer closing an epic,
I want a release note generated from the epic's real facts,
So that anyone integrating or reviewing the epic sees what changed, how to adopt it, its security posture and its test evidence.

**Acceptance Criteria:**

**Given** `docs/release-notes/TEMPLATE.md`
**When** it is read
**Then** it has these sections:
- **Summary**
- **New features:** one entry per story
- **Changes**
- **Integration notes:** migrations, new environment variables, services and ports, API changes, breaking changes, upgrade steps
- **Security:**
  - scan date and tool versions
  - totals by severity, with KEV and High/Critical counts that must be 0
  - active exceptions with expiry dates
  - a warning line for every `other` image in `images.yaml`
  - SBOM location
- **Code quality:** lint and typecheck status, backend and frontend coverage, modularity verification result
- **Test results:** new tests in this epic, split into positive and negative cases, plus the full non-regression suite with pass, fail and skip counts and duration
- **Known issues**

**Given** an epic number
**When** `deploy/release-notes.sh <epic>` runs
**Then** it creates `docs/release-notes/epic-NN-<slug>.md` from the template. It pre-fills everything factual:
- the commits since the previous epic's tag
- new Flyway migrations
- new keys in `local.env.example`
- the security reports from `build/security/`
- the `images.yaml` warnings
- coverage and test counts from the latest reports

**And** narrative sections it can't fill are marked `TODO(author)`. A check fails if any `TODO(author)` remains, or if KEV or High/Critical counts are not 0, when the epic is marked done.
**And** when an epic is closed, the commit is tagged `epic-NN`.

**Given** Epic 1 is complete
**When** its release note is generated and finished
**Then** `docs/release-notes/epic-01-local-environment.md` exists and passes the check. It lists Keycloak and Mailpit as non-DHI warnings, and shows the full Epic 1 test results.
