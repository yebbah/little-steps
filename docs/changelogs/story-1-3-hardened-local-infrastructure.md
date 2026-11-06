# Changelog: Story 1.3, Hardened local infrastructure with Docker Compose

| | |
|---|---|
| Story | 1.3, issue #28 |
| Epic | 1, Local environment and project skeleton |
| Branch | feature/epic-01-issue-28-hardened-local-infrastructure |
| Commits | ff357ea |
| Date | 2026-11-06 |
| Security report | [story-1-3-hardened-local-infrastructure.md](../security-reports/story-1-3-hardened-local-infrastructure.md) |

## Summary

One compose file now runs the local PostgreSQL, Keycloak and Mailpit services from images pinned by digest, with a Keycloak realm that is imported on start. A check script fails when the compose file and the image manifest disagree, and the image scan from Story 1.2 now scans real images.

## Added

- `deploy/compose.yaml`: PostgreSQL 18 (DHI Alpine, named volume), Keycloak 26.8.2 (DHI, dev mode, own `keycloak` schema and role) and Mailpit v1.33.0, each with a healthcheck. Presidio is a commented-out block marked "P2 (Epic 18)". Ports are bound to `127.0.0.1`.
- `deploy/images.yaml`: the image manifest (name, source, tag, digest, reason for every non-DHI image). Presidio entries carry `scan: deferred`.
- `deploy/local.env.example`: ports, credentials and the Tailscale host as placeholders. `deploy/local.env` stays git-ignored. Compose refuses to start without it and says to copy the example.
- `deploy/keycloak/littlesteps-realm.json`: realm `littlesteps` with the public client `littlesteps-pwa` (PKCE S256, rotating refresh tokens, no password grant), redirect URIs for `localhost:5173`, `localhost:8080` and `https://<tailscale host>/*`, two fictional users, mail to Mailpit, brute-force protection.
- `deploy/postgres/init/keycloak-schema.sh`, run by the one-shot `keycloak-db-init` service, because the DHI PostgreSQL image has no init-script folder.
- `deploy/check-images.sh`: fails, naming the image, on a missing manifest entry, a tag or digest mismatch, a missing digest, an `other` without a reason, a `dhi` entry outside `dhi.io`, an unknown `scan` or `source` value, or a deferred image that runs in compose. Commented Presidio references are checked too.
- `deploy/tests/check-images.test.sh` (15 checks) and `deploy/tests/realm.test.sh` (21 checks).
- `scan: deferred` marker for manifest images that do not run yet.

## Changed

- `deploy/security-scan.sh`: `cmd_images` skips entries marked `scan: deferred` with a notice, and now rejects a `scan:` line with no entry and a repeated `digest:` line. Nothing else in the script changed.
- Tags moved to the newest available to clear findings: PostgreSQL `18` to `18-alpine`, Keycloak `26.8.1` to `26.8.2` (and from `quay.io/keycloak` to `dhi.io`).
- `README.md`, `deploy/README.md`: compose usage, realm reset steps, known issue. `dev-up.sh` stays marked "arrives with Story 1.4".
- `AGENTS.md`, `docs/CONTRIBUTING.md`: the review pass, changelog and security report are produced before the human is asked to validate.

## Fixed

Found in review and fixed before this changelog:

- The deferred-image guard had no tests for bad values, and a stray `scan:` line could silently skip an image.
- The Keycloak DB role could overwrite the superuser if both used the same name; the DB password no longer appears on a command line.
- Realm redirect checks compared prefixes, not exact strings.
- Management port 9000 was published to the host without need; Keycloak now waits for a healthy Mailpit.

## Removed or deprecated

None.

## Security

Verdict PASS WITH WARNINGS. Keycloak 26.8.2, the newest tag on `dhi.io`, has 16 CVEs rated 7.0 or higher with no fixed version; they are covered by 16 written exceptions (`security/exceptions.yaml`) that expire 2026-12-04. PostgreSQL and Mailpit pass. Presidio is deferred, not scanned. See the [security report](../security-reports/story-1-3-hardened-local-infrastructure.md).

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | `docker login dhi.io` is needed to pull the DHI images; copy `deploy/local.env.example` to `deploy/local.env` and change the values | Setup |
| Development | Start the stack with `docker compose --env-file deploy/local.env -f deploy/compose.yaml up -d --wait`; run `deploy/check-images.sh` after changing an image; Keycloak is on port 8180 | Setup, `deploy/README.md` |
| Release | No change | n/a |
| Deployment | No change. Keycloak runs in dev mode and is for local use only | n/a |

## After you pull

1. `docker login dhi.io`
2. `cp deploy/local.env.example deploy/local.env` and edit the placeholder values.
3. `docker compose --env-file deploy/local.env -f deploy/compose.yaml up -d --wait`
4. Realm edits only apply to a new database: reset with `down -v` (deletes local data).

## Tests

- New positive and negative tests: `deploy/tests/check-images.test.sh` (15 passed), `deploy/tests/realm.test.sh` (21 passed).
- Non-regression: `deploy/tests/security-scan.test.sh` (63 passed, 59 existing and 4 new for the deferred marker).
- Live stack, by hand: all services healthy, PKCE token for a test user, a Keycloak email visible in Mailpit, second run of the init service succeeds.
- Image scan: `deploy/security-scan.sh` passes (secrets, backend, frontend, PostgreSQL, Keycloak with exceptions, Mailpit; Presidio deferred).

## Deferred and known issues

Tracked as `deferred` issues linked to #28:

- [#56](https://github.com/yebbah/little-steps/issues/56): Keycloak, 16 unfixed CVEs in the DHI base image, excepted until 2026-12-04. Replace the digest when DHI publishes a newer one.
- [#57](https://github.com/yebbah/little-steps/issues/57): Presidio images, CVE-2026-115557 fix not yet published. Bump digests (target 2026-12-06).
- [#58](https://github.com/yebbah/little-steps/issues/58): remove `scan: deferred` from Presidio when Epic 18 enables it (2027-02-04).
- [#59](https://github.com/yebbah/little-steps/issues/59): Keycloak healthcheck relies on bash `/dev/tcp`; recheck after image updates (2027-01-05).
- [#60](https://github.com/yebbah/little-steps/issues/60): automated stack smoke test (2027-01-05).
- [#61](https://github.com/yebbah/little-steps/issues/61): orphan, duplicate and digest-format checks in `check-images.sh` (2027-01-05).

Index: `.specs/implementation-artifacts/deferred-work.md`.
