---
title: 'Story 1.9: Release notes for each epic'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: 'f66e007'
route: 'dispatch'
context:
  - '{project-root}/.specs/planning-artifacts/epics/epic-01-local-environment.md'
---

<frozen-after-approval reason="human-owned intent, do not modify unless human renegotiates">

## Intent

**Problem:** Epic release notes are required by CONTRIBUTING but written by hand from memory, so facts drift and the security gate is not visible at epic close.

**Approach:** `docs/release-notes/TEMPLATE.md` plus `deploy/release-notes.sh <epic>` that pre-fills every factual section from git, `local.env.example`, `compose.yaml`, `images.yaml` and the latest reports, marks narrative parts `TODO(author)`, and a `check`/`tag` pair that gates closing the epic. Source: GitHub issue #34.

## Boundaries & Constraints

**Always:** bash and jq only, no network. A missing input becomes `TODO(author)`, never a zero. KEV and High/Critical (not excepted) counts must be 0 at all times; `TODO(author)` fails the check once `Status: done`. Tag is `epic-NN` (local; pushing is manual).

**Never:** no change to the blocking rule or to other scripts. No personal data or absolute paths in notes.

</frozen-after-approval>

## Code Map

- `deploy/release-notes.sh` -- generate, `check [--strict]`, `tag`, `shell-tests`.
- `docs/release-notes/TEMPLATE.md`, `README.md`, `epic-01-local-environment.md` -- template, usage, Epic 1 draft.
- `deploy/tests/release-notes.test.sh` -- throwaway git repo fixtures.
- `docs/CONTRIBUTING.md` (Finishing an epic), `README.md` (Release, Layout), `deploy/README.md`.

## Tasks & Acceptance

- [x] Template with the eight required sections
- [x] Generator pre-fills commits, migrations, env keys, services, security, images warnings, SBOM, coverage, test counts, known issues
- [x] `check` and `tag`; `shell-tests` records suite counts
- [x] Tests (positive and negative), shellcheck clean
- [x] Docs, changelog, security report, deferred issues
- [ ] Epic 1 note finished and passing: blocked on Stories 1.6 to 1.8 (#85)

## Review Triage Log

Layers run: blind (BH), edge-case (EC), verification-gap (VG), as three separate reviewers.

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | The template's own comment contains TODO(author), so a done note could never pass (EC) | high | patch, fixed | `check` strips HTML comments; test "template comment does not count as a TODO" |
| 2 | Severity compared case-sensitively, CVSS string compared as text, missing fields abort jq (BH) | medium | patch, fixed | jq normalises; test "lowercase severity and string CVSS are counted" |
| 3 | Failed tests or failed ModularityTests did not fail the check (EC) | medium | patch, fixed | tests "failed tests in the suite fail the check", "failed modularity verification fails" |
| 4 | Empty or malformed `report.json` gave a green zero or a raw jq error (EC, BH) | medium | patch, fixed | test "empty scan targets give a TODO, not a green zero" |
| 5 | `null% lines` for an empty coverage summary (EC) | medium | patch, fixed | test "empty coverage summary is a TODO" |
| 6 | Malformed `shell-tests.tsv` aborts or reaches arithmetic and awk (BH, EC) | medium | patch, fixed | numeric guard; test "malformed shell-tests.tsv does not abort" |
| 7 | `&` in an epic title corrupted on bash 5.2; quoted titles kept their quotes (BH, EC) | medium | patch, fixed | `patsub_replacement` off, quotes stripped; test "quoted title with ampersand stays literal" |
| 8 | `tag` ran on a dirty tree, so the note may not be committed (BH, EC) | medium | patch, fixed | test "tag refused with an uncommitted note" |
| 9 | Empty changelog Summary took the next heading; CRLF note failed every section; TODO without colon (EC) | low | patch, fixed | awk stops at headings; `tr -d '\r'`; test "CRLF note passes" |
| 10 | Generator ignores uncommitted work; hash-object wrote into .git; false "bound to 127.0.0.1" claim (BH) | low | patch, fixed | warning on dirty tree; constant empty-tree id; claim removed |
| 11 | shell-tests records a crashed suite as 0 failed (BH) | medium | patch, fixed | syntax check marks f=1; rc still returned non-zero |
| 12 | Epic 1 note is a draft and fails its own check; AC says Keycloak is non-DHI but `images.yaml` has it as `dhi` (VG) | high | patch, fixed (was defer #85) | Stories 1.6 to 1.8 merged; the note is finished in this branch and passes `check --strict`; the AC wording is corrected in the epic file and issue #34 (Mailpit and Presidio are the non-DHI warnings) |
| 13 | New positive/negative split is TODO(author) (VG) | medium | defer #87 | no common test marker across shell, JUnit, Vitest |
| 14 | Wrapped or nested JUnit tags, unescaped table cells, `tag` not tied to main, missing tests for template drift (BH, VG) | low | defer #86 | |
| 15 | Known issues copied verbatim from the deferred index (BH) | low | rejected | the index holds only issue numbers, dates and titles |
| 16 | `-h` prints the shellcheck line, shell skips always 0 (BH, VG) | low | rejected | cosmetic; shell tests have no skip concept |

## Verification

- `deploy/tests/release-notes.test.sh` -- 79 pass
- `shellcheck deploy/release-notes.sh deploy/tests/release-notes.test.sh` -- clean
- `deploy/release-notes.sh 1 --force && deploy/release-notes.sh check docs/release-notes/epic-01-local-environment.md` -- draft passes the gate numbers once reports exist
