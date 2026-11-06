# deploy

Dockerfile, `compose.yaml`, `images.yaml`, environment examples, Keycloak realm and bash scripts.
Filled by Stories 1.2 (security scan), 1.3 (compose), 1.4 (start and stop scripts), 1.5 (app image) and 1.9 (release notes script).

## Security scan (Story 1.2)

`security-scan.sh` is the one scan entry point. The git hook (`.githooks/pre-commit`) runs it before every commit, and CI repeats it (Story 1.8).

```bash
deploy/security-scan.sh install-tools   # once: Grype, Syft and gitleaks, pinned, checksums verified, into .tools/
deploy/security-scan.sh                 # scan everything
deploy/tests/security-scan.test.sh      # tests for the scan itself
```

It checks four targets: secrets in staged changes (gitleaks), backend dependencies (CycloneDX SBOM from the Maven plugin), frontend dependencies (`package-lock.json`, dev and transitive included) and every image in `images.yaml`. Each is scanned by Grype. A finding blocks when its CVE is in the CISA KEV catalog or its CVSS is 7.0 or more. Reports land in `build/security/` (`summary.txt`, `report.json`).
`security-policy.jq` holds the blocking rule. See `security/README.md` for exceptions.

## Local stack (Story 1.3)

`compose.yaml` runs PostgreSQL 18 (DHI, named volume), Keycloak (DHI, `start-dev`, own `keycloak` schema and role) and Mailpit. Every image is pinned by digest in `images.yaml`; Presidio is a commented-out P2 block (Epic 18).

```bash
cp deploy/local.env.example deploy/local.env     # then change the placeholder values
docker compose --env-file deploy/local.env -f deploy/compose.yaml up -d --wait
deploy/check-images.sh                           # compose and manifest must agree
deploy/tests/check-images.test.sh && deploy/tests/realm.test.sh
```

- Needs `docker login dhi.io`. Ports and credentials all come from `local.env` (git-ignored). Keycloak is on 8180, not 8080.
- The `littlesteps` realm is imported from `keycloak/littlesteps-realm.json`: public client `littlesteps-pwa` (PKCE S256, rotating refresh tokens), two fictional users, mail to Mailpit.
- The Keycloak role and schema are created by the one-shot `keycloak-db-init` service, because the DHI PostgreSQL image has no init-script folder.
- Realm changes are only imported into a new database: `--import-realm` skips a realm that already exists. After editing `keycloak/littlesteps-realm.json` or the realm values in `local.env`, reset with `docker compose --env-file deploy/local.env -f deploy/compose.yaml down -v` (this deletes the PostgreSQL volume and all local data), then start again.
- `dev-up.sh` and `dev-down.sh` arrive with Story 1.4.
- **Known issue:** Keycloak 26.8.2 (newest on `dhi.io`) has 16 High or Critical OS-package CVEs with no upstream fix. They are covered by written exceptions in `security/exceptions.yaml` that expire 2026-12-04; replace the Keycloak digest when a newer one is published. Presidio is `scan: deferred` until Epic 18. See `.specs/implementation-artifacts/deferred-work.md`.
