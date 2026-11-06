# deploy

Dockerfile, `compose.yaml`, `images.yaml`, environment examples, Keycloak realm and bash scripts.
Filled by Stories 1.2 (security scan), 1.3 (compose), 1.4 (start and stop scripts), 1.5 (app image and full mode), 1.8 (`check-actions.sh`, the action pinning check) and 1.9 (release notes script).

## Security scan (Story 1.2)

`security-scan.sh` is the one scan entry point. The git hook (`.githooks/pre-commit`) runs it before every commit, and CI repeats it (Story 1.8, root [README.md](../README.md) "Continuous integration"). In CI nothing is staged, so `LS_SECRETS_SCOPE=history` makes the secret scan read the commit history instead; the default stays staged changes.

```bash
deploy/security-scan.sh install-tools   # once: Grype, Syft and gitleaks, pinned, checksums verified, into .tools/
deploy/security-scan.sh                 # scan everything
deploy/tests/security-scan.test.sh      # tests for the scan itself
```

It checks four targets: secrets in staged changes (gitleaks), backend dependencies (CycloneDX SBOM from the Maven plugin), frontend dependencies (`package-lock.json`, dev and transitive included) and every image in `images.yaml`. Each is scanned by Grype. A finding blocks when its CVE is in the CISA KEV catalog or its CVSS is 7.0 or more. Reports land in `build/security/` (`summary.txt`, `report.json`).
`security-policy.jq` holds the blocking rule. See `security/README.md` for exceptions.

## Local stack (Story 1.3)

`compose.yaml` runs PostgreSQL 18 (DHI, named volume), Keycloak (DHI, `start-dev`, own `keycloak` schema and role) and Mailpit, plus the `app` service (built from `Dockerfile`, profile `full`, started by `dev-up.sh --full`). Every image is pinned by digest in `images.yaml`; Presidio is a commented-out P2 block (Epic 18).

```bash
deploy/dev-up.sh                                 # checks prerequisites, hook, Ollama; creates local.env; starts and waits
deploy/dev-up.sh --full                          # also build and run the app image, wait for /actuator/health
deploy/security-scan.sh scan app-image          # scan the built image (docker:littlesteps-app)
deploy/dev-down.sh                               # stop, keeping volumes and data/
deploy/dev-down.sh --wipe [--yes]                # reset: containers, volumes and data/ (typed "wipe" confirmation)
deploy/check-urls.sh                             # curl every local URL, PASS or FAIL each
deploy/check-images.sh                           # compose and manifest must agree
deploy/tests/check-images.test.sh && deploy/tests/realm.test.sh
```

- Needs `docker login dhi.io`. Ports and credentials all come from `local.env` (git-ignored). Keycloak is on 8180, not 8080.
- The `littlesteps` realm is imported from `keycloak/littlesteps-realm.json`: public client `littlesteps-pwa` (PKCE S256, rotating refresh tokens), two fictional users, mail to Mailpit.
- The Keycloak role and schema are created by the one-shot `keycloak-db-init` service, because the DHI PostgreSQL image has no init-script folder.
- Realm changes are only imported into a new database: `--import-realm` skips a realm that already exists. After editing `keycloak/littlesteps-realm.json` or the realm values in `local.env`, reset with `deploy/dev-down.sh --wipe` (this deletes the PostgreSQL volume, `data/` and all local data), then run `deploy/dev-up.sh` again.
- `dev-up.sh` and `dev-down.sh` (Story 1.4) manage the stack from any directory; setup steps and the list of local URLs to test are in the root [README.md](../README.md). To run compose by hand: `docker compose --env-file deploy/local.env -f deploy/compose.yaml up -d --wait`. `dev-up.sh` reads `LS_AI_REQUIRED` and `OLLAMA_MODEL` from `local.env` (environment wins). `deploy/tests/dev-scripts.test.sh` tests both scripts with stub `docker`, `java`, `node` and `ollama`. `check-urls.sh` requests the URLs listed in the root README (ports from `local.env`, no credentials) and is tested by `deploy/tests/check-urls.test.sh` with stub `curl` and `nc`.
- `Dockerfile` (Story 1.5) has three stages, all `FROM name:tag@digest` and listed in `images.yaml`, which `check-images.sh` verifies: `dhi.io/node:24-alpine3.23-dev` builds the PWA, `dhi.io/eclipse-temurin:25-jdk-alpine3.23-dev` builds the jar with `dist/` copied into `static/` (Maven comes from the wrapper, pinned by `distributionSha256Sum`), and `dhi.io/eclipse-temurin:25` runs it as uid 65532 with only the jar. The build context is the repo root (see `.dockerignore`). DHI has no shell-less build images for Node (no npm) or Maven, and the Debian `-dev` variants have many unfixed blocking findings, so the build stages use the Alpine `-dev` variants, which pass the normal scan (one no-fix alsa-lib exception, #68). The shipped image is also gated by `security-scan.sh scan app-image`.
- Known issues (Keycloak CVE exceptions, Presidio `scan: deferred`) are tracked as `deferred` issues; see the root [README.md](../README.md) Setup table and `.specs/implementation-artifacts/deferred-work.md`.
