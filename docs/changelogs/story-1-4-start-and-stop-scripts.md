# Changelog: Story 1.4, Start and stop scripts

| | |
|---|---|
| Story | 1.4, issue #29 |
| Epic | 1, Local environment and project skeleton |
| Branch | feature/epic-01-issue-29-start-and-stop-scripts |
| Commits | not yet committed (baseline 590a637) |
| Date | 2026-11-06 |
| Security report | [story-1-4-start-and-stop-scripts.md](../security-reports/story-1-4-start-and-stop-scripts.md) |

## Summary

`deploy/dev-up.sh` now checks every prerequisite, enables the git hook, prepares `local.env`, starts the compose stack and waits for it to be healthy. `deploy/dev-down.sh` stops it, and `--wipe` resets it after typed confirmation. First-time setup in the README uses only these scripts.

## Added

- `deploy/dev-up.sh`: lists every missing prerequisite (Docker daemon, `dhi.io` login, Java 25, Node, Grype, Syft, gitleaks) with one fix step each and exits non-zero before changing anything. Then sets `core.hooksPath`, checks Ollama and `OLLAMA_MODEL` (warning while `LS_AI_REQUIRED=false`, error with the `ollama pull` step otherwise), creates `deploy/local.env` if missing (never overwrites), runs `docker compose up -d --wait`, names the unhealthy service on timeout, reports service state and prints the local URLs using ports from `local.env`. Safe to re-run.
- `deploy/dev-down.sh`: `down` keeping volumes and `data/`; `--wipe` asks for the word `wipe`, then runs `down --volumes --remove-orphans` and removes `data/`; `--yes` skips the prompt; anything else aborts with exit 1.
- `deploy/local.env.example`: `LS_AI_REQUIRED=false` and `OLLAMA_MODEL`.
- `deploy/tests/dev-scripts.test.sh` (46 checks), using stub `docker`, `java`, `node` and `ollama` on a temp `PATH` and a temp repo copy.
- README: "Local URLs to test" table (single source; `dev-up.sh` prints the same list).

## Changed

- `README.md` Setup, Prerequisites, Development, Deployment and Layout, and `deploy/README.md`: setup through the scripts, optional Tailscale step, realm reset through `dev-down.sh --wipe`.

## Fixed

None.

## Removed or deprecated

None.

## Security

No change to the scan, compose services or images. `deploy/security-scan.sh` passes. See the [security report](../security-reports/story-1-4-start-and-stop-scripts.md).

## Operations impact

| Area | What changes (README is reviewed every story; write "reviewed, no change" if untouched) | README section |
|---|---|---|
| Setup | New one-command start, stop and reset; new `local.env` variables `LS_AI_REQUIRED`, `OLLAMA_MODEL` | Setup (rewritten), Prerequisites (dhi.io login now checked by the script) |
| Development | New test and `shellcheck` commands | Development (updated) |
| Release | Reviewed, no change | Release |
| Deployment | Local development mode now available via `dev-up.sh`; rest still planned | Deployment (updated), Layout (updated), Versions (reviewed, no change) |

## After you pull

1. `brew install shellcheck` (only to run the lint).
2. Add `LS_AI_REQUIRED=false` and `OLLAMA_MODEL=<model>` to your existing `deploy/local.env` (or leave them out: the defaults apply).
3. `deploy/dev-up.sh`.

## Tests

- New: `deploy/tests/dev-scripts.test.sh`, 46 checks: each missing prerequisite (no daemon, no login, Java 21, no tools, no Node) and nothing changed; fresh clone; re-run; `local.env` not overwritten; health timeout names the service; Ollama optional or required; stop keeps data; wipe confirmed, declined, EOF and `--yes`; bad arguments; failed init service named, empty `ps` fallback, similar model name, `LS_AI_REQUIRED=True`, quoted and CRLF values, `--wipe` with Docker down.
- Non-regression: `check-images.test.sh` 15, `realm.test.sh` 21, `security-scan.test.sh` 63, all passing. `shellcheck` clean on the three new scripts. `deploy/check-images.sh` OK.
- Not run here: a real `dev-up.sh` twice and `dev-down.sh` once on a live Docker stack (manual check in the spec).

## Review pass

Three independent reviewers (blind, edge-case, verification-gap) ran once; the Review Triage Log in the spec has every finding. Patched: failed one-shot service now named, Java version parsing, env value parsing and `LS_AI_REQUIRED` case, exact Ollama model match, Docker check before the `--wipe` prompt, test fixture fixes, and the missing optional Tailscale step in the README. Rejected: Java 26+, re-run idempotency, and several unlikely edge cases (reasons in the log).

## Deferred and known issues

- #65: `dev-up.sh` does not check `jq`, `git` or a Compose version with `--wait-timeout` (target 2027-01-05).
- #66: health reporting is tested only against stubs, not real `docker compose ps` output (target 2027-01-05; related #60).
- Keycloak CVE exceptions remain tracked in #56.
