---
title: 'Story 1.3: Hardened local infrastructure with Docker Compose'
type: 'feature'
created: '2026-11-06'
status: 'done'
route: 'dispatch'
baseline_commit: 'dbd3cead2df2d654b8950ad613d44065be2e4f42'
review_loop_iteration: 0
context:
  - '{project-root}/little-steps/.specs/implementation-artifacts/epic-1-context.md'
  - '{project-root}/little-steps/.specs/planning-artifacts/epics/epic-01-local-environment.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** There is no shared local stack. Each machine would run different PostgreSQL, Keycloak and mail services, from unpinned images, and the image scan from Story 1.2 has no manifest to scan.

**Approach:** One `deploy/compose.yaml` runs PostgreSQL (DHI), Keycloak and Mailpit, every image pinned by digest in `deploy/images.yaml`. A bash check script fails when compose and the manifest disagree. Keycloak imports a `littlesteps` realm on start. Ports and credentials come from `deploy/local.env`.

## Boundaries & Constraints

**Always:**
- Manifest entry fields: `name`, `source` (`dhi` or `other`), `tag`, `digest`, and `reason` for every `other`. Keep `name:` before `digest:` in each entry: Story 1.2's `security-scan.sh images` parses that order and scans `registry:name@digest`.
- Entries: `dhi.io/postgres` 18 (`dhi`); `dhi.io/keycloak` 26.8.1 (`dhi`: the live catalog check on 2026-11-06 found it, so it moves from `quay.io/keycloak` as the story requires); `axllent/mailpit` v1.33.0 (`other`, not in DHI catalog, local only); Presidio analyzer and anonymizer 2.2.366 from `ghcr.io/data-privacy-stack/` (`other`, not in DHI catalog, P2). The catalog was checked for Mailpit and Presidio and neither exists there.
- Compose uses literal `image: name:tag@digest` (no variable) so the check script can compare it to the manifest.
- PostgreSQL: named volume, one database, Keycloak in its own schema `keycloak` with its own role. Keycloak runs `start-dev --import-realm`.
- Realm `littlesteps`: public client `littlesteps-pwa`, PKCE S256 required, refresh token rotation on (no reuse). Redirect URIs for `http://localhost:5173`, `http://localhost:8080` and `https://${LS_TAILSCALE_HOST}/*`. Users `caregiver.a@example.test` and `caregiver.b@example.test`, passwords from env placeholders. SMTP to Mailpit.
- Every port, credential and the Tailscale host come from `deploy/local.env`; `deploy/local.env.example` holds defaults that are obvious placeholders. `local.env` stays git-ignored. Keycloak must not use port 8080 (the app's).
- Each service has a healthcheck; compose reports all healthy.
- Presidio services are a commented-out block marked "P2 (Epic 18)".
- `deploy/check-images.sh` fails (non-zero, names the image) on: a compose image missing from the manifest, a tag or digest mismatch, a manifest entry without a digest, an `other` without a reason, or a `dhi` entry not from `dhi.io`. Commented Presidio refs are checked too.
- Scan the three live images with Story 1.2's scan; no KEV, High or Critical finding. Without a fix, use `security/exceptions.yaml`.

**Never:**
- No `latest`-only tags without a digest. No committed secrets or real personal data. No dev-up/dev-down scripts (Story 1.4), no app image (Story 1.5), no Flyway tables (Story 1.6), no Trivy.
- Do not edit `security-scan.sh` beyond what the manifest needs. Do not document `dev-up.sh` as existing; mark it "arrives with Story 1.4".

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Stack starts | `docker compose --env-file deploy/local.env -f deploy/compose.yaml up -d` | postgres, keycloak, mailpit healthy; realm exists | N/A |
| Refs match | compose and manifest agree | check script exit 0 | N/A |
| Digest drift | compose digest differs from manifest | exit 1 | Names the image and both digests |
| Unlisted image | compose image not in manifest | exit 1 | Names the image |
| `other` without reason | manifest entry lacks `reason` | exit 1 | Names the entry |
| Missing env | `local.env` absent | compose refuses to start | Message says to copy the example |
| Realm check | read the realm JSON | PKCE S256, rotation, redirect URIs, two users, SMTP as above | Test fails on any missing item |

</frozen-after-approval>

## Code Map

- `deploy/security-scan.sh` -- `cmd_images` (parses `name:` then `digest:`), `scan_images` (grype `registry:name@digest`; fails when compose exists without manifest). Reuse, do not change.
- `deploy/tests/security-scan.test.sh` -- test style (`check` helper) to copy for new tests; images cases at lines ~151-180.
- `.gitignore` -- already ignores `local.env`, keeps `*.env.example`, ignores `/data/`.
- `deploy/README.md`, `README.md` (Setup, Development) -- update; `dev-up.sh` arrives with 1.4.
- `docs/changelogs/`, `docs/security-reports/` -- written at story finish from TEMPLATE.md.
- Index digests read 2026-11-06 (Docker running, `dhi.io` login works): `dhi.io/postgres:18` `sha256:76d0081a…`; `dhi.io/keycloak:26.8.1` `sha256:aa0f72fa…` (the `-dev` variant exists too); `axllent/mailpit:v1.33.0` `sha256:9b3a463b…`; Presidio analyzer 2.2.366 `sha256:036d2f9b…`, anonymizer `sha256:b4d9ec90…`. Re-read the full digests when writing the manifest.

## Tasks & Acceptance

**Execution:**
- [x] `deploy/images.yaml` -- manifest of the 5 images with digests -- AD-26
- [x] `deploy/compose.yaml` -- postgres, keycloak, mailpit, healthchecks, volume, commented Presidio -- one stack
- [x] `deploy/postgres/init/` -- create the `keycloak` role and schema -- Keycloak's own schema
- [x] `deploy/local.env.example` -- ports, credentials, `LS_TAILSCALE_HOST` placeholders -- no secrets committed
- [x] `deploy/keycloak/littlesteps-realm.json` -- realm, client, users, SMTP -- imported on start
- [x] `deploy/check-images.sh` -- compose vs manifest check -- drift gate
- [x] `deploy/tests/check-images.test.sh`, `deploy/tests/realm.test.sh` -- positive and negative tests per matrix -- tests
- [x] `deploy/README.md`, `README.md` -- document compose use -- docs

**Acceptance Criteria:**
- Given a copied `local.env`, when compose starts, then all three services report healthy and a token request with PKCE for `caregiver.a@example.test` succeeds.
- Given the stack runs, when Mailpit receives a Keycloak test email, then it appears in the Mailpit UI.
- Given `deploy/security-scan.sh`, when it runs, then the images target covers every manifest image and passes.
- Given the existing scan tests, when run, then they still pass.

## Implementation Notes

- Tags moved to the newest available on 2026-11-06 to clear scan findings: `dhi.io/postgres:18-alpine` (0 findings; the `18` Debian tag had 70+ unfixed High/Critical CVEs), `dhi.io/keycloak:26.8.2` (was 26.8.1), Presidio `2.2.366-distroless`. The frozen text names `postgres` 18 and Keycloak 26.8.1; these are the same products at newer or hardened tags.
- The DHI PostgreSQL image has no `docker-entrypoint-initdb.d`. Keycloak's role and schema come from the one-shot `keycloak-db-init` service running `deploy/postgres/init/keycloak-schema.sh` on the same pinned image.
- The DHI Keycloak image has bash but no curl or grep, so the healthcheck uses `/dev/tcp` against management port 9000. Keycloak is published on 8180 (8080 is the app's).
- Scan status: PASS for PostgreSQL and Mailpit, and for Keycloak through 16 exceptions (no fix upstream, expire 2026-12-04). The P2 Presidio images (one CVE, fix not yet rebuilt; 2.2.366 is the newest release) are marked `scan: deferred` in `images.yaml`: `security-scan.sh` skips them with a notice, and `check-images.sh` fails if a deferred image runs in compose. This is a small manifest-driven change to `cmd_images` in `security-scan.sh`, approved by the human. Logged in `deferred-work.md`; 16 Keycloak exceptions were written.

## Spec Change Log

- 2026-11-06, human direction during implementation (no loopback needed): (1) use the newest available tags and, where the scan still fails, document the finding as deferred instead of blocking: PostgreSQL `18` became `18-alpine`, Keycloak `26.8.1` became `26.8.2`, Presidio stayed on `2.2.366-distroless`. (2) Presidio is not scanned while it is commented out in compose: `scan: deferred` marker, with a small change to `cmd_images` in `security-scan.sh` that the frozen Code Map said not to make. (3) Acceptance criterion 3 is met only through 16 written, time-limited exceptions for Keycloak 26.8.2 (no fix upstream, expiry 2026-12-04), chosen by the human on 2026-11-06 over waiting for a newer DHI digest. KEEP: the Debian-free PostgreSQL image, the `keycloak-db-init` service, the bash `/dev/tcp` Keycloak healthcheck, and the `check-images.sh` guard that rejects a deferred image running in compose.

## Review Triage Log

Three reviewer subagents ran in parallel (Blind Hunter, Edge Case Hunter, Verification Gap) on the diff from `baseline_commit`, untracked files included. Layer names: blind, edge, gap.

| # | Layer | Finding | Verdict | Evidence / route |
|---|-------|---------|---------|------------------|
| 1 | gap | No tests for an unknown `scan` value, an unknown `source`, or a compose image with a digest but no tag | medium | Real: the guard presented as mitigating the new bypass was unpinned. Patched: three negative tests in `check-images.test.sh`. |
| 2 | edge | `active_refs \| grep -q` under pipefail can SIGPIPE; the name is used as a regex; an untagged ref is missed | low | Real but unlikely. Patched: refs captured once, exact-prefix match in awk (name followed by `:` or `@`). |
| 3 | edge | `scan:` line before any `name:` leaks onto the first entry; a duplicate `digest:` line is no longer rejected | medium | Real: the first would silently skip an image. Patched in `cmd_images`: both are errors. |
| 4 | blind | `scan: "deferred"` treated as deferred by `check-images.sh` but as scanned by `security-scan.sh` | low | Real, mild. Patched: `cmd_images` strips quotes and trailing comments like `check-images.sh`. |
| 5 | edge, gap | Security-scan test relies on stderr/stdout ordering | low | Real fragility. Patched: separate assertions for the notice and the listed image. |
| 6 | blind | Realm test redirect checks use `startswith` and would accept a look-alike host | medium | Real. Patched: exact strings plus a count of exactly three URIs. |
| 7 | blind, edge | Missing-env test counts as FAIL when Docker is absent | low | Real. Patched: skip with a notice. |
| 8 | edge | `LS_KEYCLOAK_DB_USER` equal to the superuser would overwrite the superuser role | medium | Real. Patched: `keycloak-schema.sh` exits with a message. |
| 9 | blind | `REVOKE ALL ON SCHEMA public FROM keycloak` revokes nothing (rights come from PUBLIC); password passed on the `psql` command line | low | Real: misleading line and an exposed argument. Patched: line removed, values read with `\getenv`. Verified by a clean re-run and a second run. |
| 10 | blind, edge | Keycloak waits on Mailpit with `service_started`; DB variables lack the `:?` guard | low | Real. Patched: `service_healthy` and guards added. |
| 11 | blind | Management port 9000 published to the host without need | low | Real, mild. Patched: mapping and `LS_KEYCLOAK_MGMT_PORT` removed. |
| 12 | blind | No brute-force protection in the realm | low | Patched: `bruteForceProtected` on (verified in the live realm). |
| 13 | blind, edge | Realm import skips an existing realm, so edited passwords or redirect URIs do nothing; `$` or `}` in passwords is mangled | medium | Real, documentation gap. Patched: reset steps in `deploy/README.md`, password character note in `local.env.example`. |
| 14 | blind | Nothing tells contributors that commits fail while the Keycloak scan is red | medium | Real. Patched: known-issue line in the root README. |
| 15 | gap | PKCE token request and Mailpit email are verified by hand only; no smoke test for the DB init, volume or healthcheck | medium | Defer: needs Docker and `dhi.io` in the test path, which the other tests avoid. Logged in `deferred-work.md`. |
| 16 | blind, edge | `check-images.sh` does not flag orphan or duplicate manifest entries, validate digest format, or handle single-quoted, multi-line or `|`-containing values | low | Defer (orphan and duplicate checks) and reject the rest as unlikely with a more than trivial fix. Logged in `deferred-work.md`. |
| 17 | blind | Presidio fix version differs between `deferred-work.md` and the report; `CVE-2026-12345` looks like a placeholder | false | The two fix versions belong to different CVEs (115557 vs 114583 and 12345). Both IDs are verbatim from the Grype output of 2026-11-06. |
| 18 | edge | All entries `scan: deferred` would pass the images scan with nothing scanned | false | `scan_images` already fails with "lists no image with a digest" when no reference is left. |
| 19 | blind | Branching policy text in `AGENTS.md`, `CONTRIBUTING.md` and the README is mixed into this story | false | Those edits were already in the working tree before this story started; this story only added the finishing-order rule. |
| 20 | blind | `sslRequired: none`, default `change-me` passwords, placeholder Tailscale host registered as a redirect URI | low | Reject: local development defaults, documented in the example file and README; the fix would add warnings for no demonstrated harm. |
| 21 | blind, edge, gap | Acceptance criterion 3 and the frozen text (tags, `security-scan.sh` untouched) do not hold; changelog and report sections were pending | bad_spec | Caused by human-directed decisions, not a code defect, so no loopback. Recorded in the Spec Change Log above; the Keycloak decision (exceptions) is made; changelog and report are written. |

## Design Notes

Keycloak substitutes `${ENV_VAR}` placeholders in imported realm files, so user passwords and the Tailscale host live in `local.env`, not in the JSON. The Keycloak schema comes from an init script in the PostgreSQL image; verify that the DHI image supports `docker-entrypoint-initdb.d` and has a shell or `pg_isready` for the healthcheck, and adapt if not. The DHI Keycloak runtime image may have no shell or curl: if so, use the `-dev` variant only if nothing else works (and record why), or a healthcheck that needs no shell tools. `start-dev` and `--import-realm` must be verified against the DHI image's entrypoint.

## Verification

**Commands:**
- `deploy/check-images.sh` -- expected: exit 0
- `deploy/tests/check-images.test.sh && deploy/tests/realm.test.sh && deploy/tests/security-scan.test.sh` -- expected: all pass
- `docker compose --env-file deploy/local.env -f deploy/compose.yaml up -d --wait` -- expected: all services healthy
- `deploy/security-scan.sh` -- expected: PASS across all targets

**Manual checks (if no CLI):**
- Open Mailpit UI and Keycloak admin; the `littlesteps` realm lists two users.
