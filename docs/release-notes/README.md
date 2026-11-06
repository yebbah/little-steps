# docs/release-notes

One release note per completed epic, `epic-NN-<slug>.md`, generated from [TEMPLATE.md](TEMPLATE.md) by `deploy/release-notes.sh`. The steps to close an epic are in [CONTRIBUTING.md](../CONTRIBUTING.md#finishing-an-epic).

```bash
deploy/release-notes.sh shell-tests            # run deploy/tests/*.test.sh, record counts for the note
deploy/release-notes.sh <epic>                 # create the note (--force regenerates, discarding edits)
deploy/release-notes.sh check <note.md>        # [--strict] the gate
deploy/release-notes.sh tag <epic>             # strict check, then tag HEAD epic-NN (push it yourself)
deploy/tests/release-notes.test.sh             # tests for the script
```

## What is filled in, and from where

| Section | Source |
|---|---|
| New features | one entry per `### Story` in the epic file; the summary comes from the story's changelog |
| Changes | commits since the previous epic's tag `epic-(NN-1)` (the whole history for epic 1) |
| Integration notes | new Flyway migrations (`backend/src/main/resources/db/migration`), new keys in `deploy/local.env.example`, services in `deploy/compose.yaml`, ports |
| Security | `build/security/summary.txt` and `report.json` (written by `deploy/security-scan.sh`), `deploy/images.yaml` (a warning for every `other` image), SBOM files, the stories' security reports |
| Code quality | `backend/target/site/jacoco/jacoco.csv`, `frontend/coverage/coverage-summary.json`, `ModularityTests` surefire report |
| Test results | `backend/target/surefire-reports/TEST-*.xml`, `frontend/test-results/junit.xml`, `build/test-reports/shell-tests.tsv` |
| Known issues | the index in `.specs/implementation-artifacts/deferred-work.md` |

A missing input is never shown as zero: the line becomes `TODO(author)` and the check fails until the input exists. Lint, typecheck, the summary, the positive/negative split of new tests and the narrative parts are written by the author.

## The check

`check` always fails when the KEV or High/Critical count (findings not covered by an exception) is not 0, when the scan result is not PASS, or when a section or the `Status:` line is missing. While `Status: draft`, remaining `TODO(author)` are allowed; at `Status: done` (or with `--strict`) any `TODO(author)` fails it.

Epic 1's note is [epic-01-local-environment.md](epic-01-local-environment.md).
