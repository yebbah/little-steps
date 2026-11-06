---
title: 'Story 1.4: Start and stop scripts'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: '590a637a4441ca6454c93cbd07bcec4c0ad1a912'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/little-steps/.specs/implementation-artifacts/epic-1-context.md'
  - '{project-root}/little-steps/.specs/planning-artifacts/epics/epic-01-local-environment.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Starting the local stack takes several manual steps (tools, hook, `local.env`, compose, waiting), and a missing prerequisite surfaces as a late, confusing failure. There is no one-command stop or reset.

**Approach:** `deploy/dev-up.sh` checks every prerequisite, enables the git hook, prepares `local.env`, starts compose and waits for health. `deploy/dev-down.sh` stops it, and `--wipe` resets it after typed confirmation. Source: GitHub issue #29.

## Boundaries & Constraints

**Always:**
- Both scripts are bash with `set -euo pipefail`, pass `shellcheck`, and work from any current directory (resolve the repo root from `BASH_SOURCE`).
- `dev-up.sh` checks all prerequisites first and prints every missing one with exactly one fix step each, then exits non-zero before changing anything (no hook setting, no `local.env`, no containers). Prerequisites: Docker Desktop (daemon reachable), `dhi.io` login, Java 25, Node, Grype, Syft and gitleaks (on `PATH` or in `.tools/` as `security-scan.sh` pins them; fix step `deploy/security-scan.sh install-tools`).
- After the checks: `git config core.hooksPath .githooks`; Ollama and `OLLAMA_MODEL` check (warning only while `LS_AI_REQUIRED=false`, the default; otherwise an error with the `ollama pull <model>` step, exit non-zero before starting); create `deploy/local.env` from the example if missing (never overwrite); `docker compose --env-file deploy/local.env -f deploy/compose.yaml up -d --wait`; on timeout name the unhealthy service; print URLs for the app (`http://localhost:8080`, noted as not running until it exists), Keycloak, Mailpit and the database, using ports from `local.env`.
- Running `dev-up.sh` again with everything up is harmless and reports state (services and health).
- `dev-down.sh` runs `docker compose ... down` and keeps volumes and the local storage folder (`/data/` at the repo root). `--wipe` asks for typed confirmation (the word `wipe`), then runs `down --volumes --remove-orphans` and removes the storage folder; `--yes` skips the prompt. Anything else typed aborts with nothing removed.
- Add `LS_AI_REQUIRED=false` and `OLLAMA_MODEL` placeholders to `deploy/local.env.example`.
- README: first-time setup uses only these scripts, plus the optional Tailscale step. Review all README sections per AGENTS.md and list them in the changelog.

**Never:**
- No app image or app start (Story 1.5), no Flyway tables, no change to `security-scan.sh` or compose services. No `--no-verify`. No secrets or absolute local paths committed. Do not echo passwords from `local.env`.
- Tests never touch the real Docker stack or delete real volumes or `/data/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Prerequisite missing | e.g. no Docker, no `dhi.io` login, Java below 25 | Lists each missing item with one fix step | Exit non-zero, nothing started or changed |
| Fresh clone | no `local.env` | Hook set, `local.env` copied, stack up, URLs printed | N/A |
| Re-run while up | stack healthy | Reports state, changes nothing | N/A |
| Health timeout | a service never healthy | Names the failed service | Exit non-zero |
| Ollama, AI optional | `LS_AI_REQUIRED=false`, Ollama or model missing | Warning, continues | N/A |
| Ollama, AI required | `LS_AI_REQUIRED=true`, model missing | Error with `ollama pull` step | Exit non-zero before starting |
| Stop | stack running | Containers stop, volumes and `/data/` kept | N/A |
| Wipe confirmed | typed `wipe`, or `--yes` | Containers, volumes, `/data/` removed | N/A |
| Wipe declined | anything else typed | Nothing removed | Exit non-zero with "aborted" |

</frozen-after-approval>

## Code Map

- `deploy/security-scan.sh` -- tool paths `$TOOLS_DIR/<name>-<version>/<name>` (lines ~25, 65); pinned versions at lines ~34-36. Reuse the convention; do not change.
- `deploy/compose.yaml`, `deploy/local.env.example` -- stack and variables; the example already carries ports and passwords. Keycloak 8180, Mailpit UI 8025, Postgres 5432.
- `deploy/tests/check-images.test.sh` -- test style (`check` helper, temp dir) to copy.
- `.gitignore` -- `/data/` already ignored (local storage folder), `local.env` ignored.
- `README.md` (Prerequisites, Setup table rows "arrives with Story 1.4"), `deploy/README.md`, `.githooks/pre-commit` -- update docs; hook unchanged.
- `docs/changelogs/TEMPLATE.md`, `docs/security-reports/` -- written at story finish. `shellcheck` is not installed locally: install via `brew install shellcheck` to verify.

## Tasks & Acceptance

**Execution:**
- [x] `deploy/dev-up.sh` -- prerequisite checks, hook, Ollama check, `local.env`, compose up and wait, URLs, idempotent state report
- [x] `deploy/dev-down.sh` -- stop; `--wipe` with typed confirmation and `--yes`
- [x] `deploy/local.env.example` -- add `LS_AI_REQUIRED=false`, `OLLAMA_MODEL`
- [x] `deploy/tests/dev-scripts.test.sh` -- positive and negative tests for the matrix using stub `docker`, `java`, `node`, `ollama` on a temp `PATH` and a temp repo copy; no real Docker
- [x] `README.md`, `deploy/README.md` -- setup via the scripts, optional Tailscale step, README review; add a "Local URLs to test" table to the README Setup section (the single source: `dev-up.sh` prints the same list, `deploy/README.md` links to the README)
- [x] `deploy/security-scan.sh` -- run; `docs/changelogs`, `docs/security-reports` -- finish per AGENTS.md

**Acceptance Criteria:**
- Given the scripts, when `shellcheck` runs on them and the new test, then it passes.
- Given a real Mac with the prerequisites, when `dev-up.sh` runs twice and `dev-down.sh` once, then the stack comes up healthy, the second run changes nothing, and the stop keeps volumes.
- Given the new and existing tests, when run, then all pass.

## Implementation Notes

## Spec Change Log

## Review Triage Log

Layers run: blind-hunter, edge-case-hunter, verification-gap (iteration 1).

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Failed one-shot (`keycloak-db-init` exit non-zero) skipped by `report_unhealthy`; fallback names nothing; stub test circular (VG, EC, BH) | medium | patch | `dev-up.sh:429` skips every `exited` row with empty health; `keycloak` waits on the init with `service_completed_successfully`, so a failed init is the likely first-run failure |
| 2 | `java_major` mishandles `25-ea` / odd output (EC) | low | patch | `out` keeps `25-ea`, fails `!= "25"`; direct fix with sed |
| 3 | `env_value`: CR, quotes, inline comment, missing key; `LS_AI_REQUIRED=True` read as false (EC, BH) | low | patch | `${line#*=}` verbatim; case-sensitive compare; direct fix |
| 4 | `$model` used as regex, `llama3.2` matches `llama3x2` (EC, BH, VG) | low | patch | `dev-up.sh:392` `grep -Eq` unescaped; use fixed-string match |
| 5 | `dev-down.sh` has no Docker preflight; `--wipe` prompts before failing (EC, BH) | low | patch | one-line `docker info` check before the prompt |
| 6 | Tests: hardcoded tool versions; global git `core.hooksPath` leaks into fixtures; circular "no password echoed" test (BH, EC) | low | patch | fixture `new_repo` hardcodes pins; `hook()` reads global config; password test greps a run that cannot print credentials |
| 7 | README has no optional Tailscale step; spec (frozen) requires it in first-time setup (BH) | medium | patch | README only has a table row saying "arrives with Story 1.5"; epic AC at line 159 requires the step; add a short README step, the `tailscale serve` command itself stays Story 1.5 |
| 8 | `jq`, `git`, Compose version not checked by `dev-up.sh` (BH) | low | defer | spec's prerequisite list is explicit and excludes them; `jq` absence breaks `security-scan.sh`, not this story's scripts |
| 9 | Java 26+ rejected (BH) | false | rejected | README, build and spec all pin Java 25; the build stops with "Java 25 is required" |
| 10 | Re-run recreates containers / sets hook again; Ollama error after hook set (BH, EC) | false | rejected | `compose up -d` is a no-op for an unchanged stack and `git config` writes the same value; spec orders hook before Ollama |
| 11 | `LS_WAIT_TIMEOUT` unvalidated; `docker info` can hang; HOME unset; `rm -rf` failure message; `ollama list` server-down vs missing; `up` failure misreported as health timeout; host binaries on safe PATH (EC, BH) | low | rejected | unlikely in everyday use and each fix adds guards or branches; `compose up` stderr is not captured so real errors print |
| 12 | `dhi.io` check is a config.json presence test (BH, EC) | low | rejected | Docker Desktop writes `auths."dhi.io"` on login; stale token cannot be told apart without a network call |
| 13 | Spec copy of URL table, README/`print_urls` sync test, realm user hint (BH, VG) | low | rejected | fix is to edit this build's spec, or adds a test for a comment-guarded list |
| 14 | `git config` outside a repo; `data/` vs `/data/`; symlink claim untested; node fix names node@24; fix steps chain two actions (BH, EC) | low | rejected | not reachable in normal use or matches the spec text |
| 15 | Story not ready: unchecked tasks, empty logs, review pass not recorded, deferred list (BH) | medium | patch | process items; completed in the finish step (tasks, this log, changelog review section, deferred issue for #8) |
| 16 | No real-Docker verification of `ps --format` (VG, EC) | medium | defer | cannot be settled without a live stack; stays the manual acceptance check and is recorded as unverified |

## Verification

**Commands:**
- `shellcheck deploy/dev-up.sh deploy/dev-down.sh deploy/tests/dev-scripts.test.sh` -- expected: no output
- `deploy/tests/dev-scripts.test.sh && deploy/tests/check-images.test.sh && deploy/tests/realm.test.sh && deploy/tests/security-scan.test.sh` -- expected: all pass
- `deploy/check-images.sh` -- expected: exit 0
- `deploy/security-scan.sh` -- expected: PASS

**Local URLs to test** (ports from `local.env`; defaults shown; these go in the README table):

| What | URL | Expect |
|---|---|---|
| Keycloak admin console | http://localhost:8180/admin | login page; admin user and password from `local.env` |
| Keycloak realm metadata | http://localhost:8180/realms/littlesteps/.well-known/openid-configuration | JSON with issuer `.../realms/littlesteps` |
| Keycloak account console (test user login) | http://localhost:8180/realms/littlesteps/account | login for a fictional realm user |
| Mailpit inbox | http://localhost:8025 | empty inbox UI |
| Mailpit API | http://localhost:8025/api/v1/info | JSON with version |
| PostgreSQL (not HTTP) | `psql -h localhost -p 5432 -U littlesteps littlesteps` | connects (password from `local.env`) |
| App (arrives with Story 1.5) | http://localhost:8080 | connection refused until then |

**Manual checks:**
- Run `deploy/dev-up.sh` from another directory: stack healthy, URLs printed; open each URL in the table above; run again: reports state; `deploy/dev-down.sh`: containers stopped, data kept.
