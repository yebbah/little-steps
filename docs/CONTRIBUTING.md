# Contributing to LittleSteps

Project policies for everyone working in this repo, human or AI. They apply whatever tool or framework drives the work.

## Documentation

Prefer linking to an existing document over repeating its content. Each rule or fact lives in one place; every other document links to it. Before writing a rule or fact, search the docs for where it already lives, and add it there. This file is the source for project policies.

## Spec first

The specs are the contract: the PRD, the SPEC, the architecture spine, the UX documents and the epics and stories (all under `.specs/`). A change is never made in code, or fixed in a bug issue, when it would make the code differ from a spec.

1. **Check for drift before you start.** Compare the change with the specs it touches (requirement, AD, UX rule, story acceptance criteria). If the specs already describe the intended behaviour, the code is the bug: fix the code.
2. **If the change would cause drift, update the specs first.** Run the spec update (`bmad-spec` for the SPEC, the PRD, architecture or UX skill for those documents, `bmad-correct-course` for a change that spans several) and get the human to confirm it. Update every affected document in the same pass: requirements, AD, SPEC, UX, `epics/requirements.md`, the epic files and `epics/index.md`.
3. **Then raise the issue** (feature request, change or bug) and link the spec update in it. An issue that needs a spec change is not created, assigned or started before step 2 is done.
4. **Then implement.** The PR links the spec change, and the story's changelog records it under "Changed".
5. **Never fix first and document later.** A found deviation (code that already differs from a spec) is not silently kept: either fix the code to match, or update the spec by the steps above before the story closes. "Spec drift" is never a deferred item.

The architecture spine's rule applies to agents too: a contradiction between specs, or between a spec and the code, is surfaced to the human, never resolved locally.

The decision trees behind these policies are drawn in [workflow.md](workflow.md). Update it in any change to a policy or to the CI workflow.

## Issues

- Epic N is GitHub issue #N+1, labelled `epic` plus `P1` or `P2`. The exception is Epic 24, which is #107 because #25 was already a pull request.
- When an epic is approved, each of its stories is created as a sub-issue (labels `story` plus `P1`/`P2`, full story text):

  ```sh
  gh issue create ...
  gh issue edit <n> --parent <epic>
  ```

- The epic issue carries a "Tracked as sub-issues #X to #Y" line instead of a checklist.

## Branching

One branch per level of the issue hierarchy: epic, issue (story) and sub-issue. Every branch is cut from an up-to-date `main` and merged back to `main`, whatever its level.

| Level | Name | Cut from |
|---|---|---|
| Epic | `feature/epic-<NN>-<slug>` | `main` |
| Issue (story) | `feature/epic-<NN>-issue-<N>-<slug>` | `main` |
| Sub-issue | `feature/epic-<NN>-issue-<N>-sub-<M>-<slug>` | `main` |

Example: `feature/epic-01-issue-28-hardened-local-infrastructure`.

- Update `main` first (`git checkout main && git pull`), then branch.
- **Always cut a new branch from `main` when starting a story**, even when the current branch is clean, recently merged or named for related work. Never build a story on top of another branch (for example a docs or policy branch). Agents must not ask which branch to use: switch to `main`, pull, and create the story branch.
- Each branch is merged into `main` by PR. Merge a story before starting the next story that depends on it.
- Write `Closes #N` in a PR body for the issue that PR completes. The epic's issue is closed only when the whole epic is done.
- PRs are squash-merged. Never force-push a shared branch.
- Commit messages are conventional (`feat:`, `fix:`, `docs:`, `chore:`) and reference the story issue.
- The repository is public: no personal data, secret values or absolute local paths in any file.

## Continuous integration

- CI ([ci.yml](../.github/workflows/ci.yml)) runs on every push and pull request. The jobs, secrets, artifacts and caches are in the [README](../README.md#continuous-integration); the flow is in [workflow.md](workflow.md#5-continuous-integration).
- A PR is merged only when all CI jobs are green. Never merge on red, never skip or disable a job to get green, and never rerun a failing job until it passes without finding out why (a flaky test becomes a `deferred` issue).
- A change to the CI workflow follows the same rules as code: spec first when it changes what a spec requires (for example which scans run in CI), and every action is pinned to a full commit SHA.
- Backend test classes end in `Test` or `Tests`: Maven Surefire runs no other name, so a misnamed class passes by never running. CI fails when the `ModularityTests` or `PersistenceBaselineTests` report is missing.
- Frontend coverage must stay at or above 80% for lines, statements, functions and branches: Vitest fails the build below that (AD-28). Lowering the floor is a spec change.
- A required CI script or report that is missing fails the job. CI never skips a check because its script has not arrived yet (the skip in the OpenAPI type check is removed by #88).
- Checks that CI does not run (image scans, app image build) are run by hand before a release and recorded in the epic's release note.

## Security gate

- Every commit must pass `deploy/security-scan.sh` (pre-commit hook in `.githooks/` and CI). The blocking rule (CISA KEV, CVSS 7.0 or more) and the exceptions are in [security/README.md](../security/README.md).
- Never use `--no-verify`; CI repeats the scan, so a skipped hook still fails.
- Use Grype for scanning, not Trivy. Pin GitHub Actions to full commit SHAs with the version in a comment; `deploy/check-actions.sh` fails CI on a tag or branch.
- Container images come from Docker Hardened Images (`dhi.io`) when the catalog has them. An image from elsewhere is listed as a warning in the epic's release note.
- Background: AD-25, AD-26 and AD-27 in the architecture spine, NFR-20 to NFR-22, and the epic Definition of done.

## Finishing a story

Before a story's last commit:

**Order rule:** produce the review pass, changelog and security report first, then ask the human to validate. Never ask for validation, a decision or a sign-off on a story before those three artifacts exist. If a blocker remains (for example a failing scan), the security report records it as the verdict and the open decision, so the human reviews the full picture in one go. Fill sections that depend on a later step (such as review findings) as soon as that step is done; do not hand over a report with "pending" sections when the step can be run.

0. **Scan cadence.** Run `deploy/security-scan.sh` exactly twice per story outside the commit hook: once before handing the story to the human for validation (its numbers feed the security report), and once after every fix required by the review triage log is done (the final gate, before the last commit). Do not re-run it after each intermediate fix; the pre-commit hook still scans each commit.
1. Run an independent review pass with three separate reviewers: blind (diff only), edge cases, and verification gaps. Triage every finding with evidence, fix the real ones, and record the triage in the story's spec or review log. Every `patch` row ends as `patch, fixed` once the fix is in the code and a test or check shows it; no row may stay plain `patch` at the second scan or the last commit. A row not fixed is changed to `defer #<issue>` or `rejected` with the reason. A self-review does not replace this.
2. Write the changelog: `docs/changelogs/story-<N>-<M>-<slug>.md` from `docs/changelogs/TEMPLATE.md`, plus a row in the index in that folder. Changelogs are per story, not per epic.
3. Write the security report: `docs/security-reports/story-<N>-<M>-<slug>.md` from `docs/security-reports/TEMPLATE.md`. Fill every section, with numbers from `build/security/summary.txt` and `report.json`. Security reports are per story, not per epic.
4. Review and update `README.md` in every story, whether or not the story seems to touch it: check Prerequisites, Setup, Development, Release, Deployment, Layout and Versions against the code and the story's changes, and fix anything stale. Record each section touched, or "reviewed, no change", in the changelog's Operations impact table. Mark steps that do not exist yet as "arrives with Story X"; never document what does not exist.
5. Log every deferred item as a GitHub issue (see "Deferred items" below) before pushing, put the issue number in the triage log's `defer` rows, and run the index sync check in [deferred-items.md](deferred-items.md#keeping-it-fresh-one-command-at-story-finish).
6. Push the branch and close the story's issue with a short comment (commit, result, links to the deferred issues).

## Review triage log format

One table per story, in the story's spec under `## Review Triage Log`, with these columns:

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|

- **Finding:** what was found, with the reviewer layers in brackets (BH blind, EC edge, VG gap).
- **Verdict:** `high`, `medium`, `low` or `false`.
- **Route:** `patch, fixed`, `defer #<issue>`, `rejected`, or `intent_gap, resolved`. Plain `patch` is only allowed while the fix is in progress (see step 1 above).
- **Evidence:** the file, test or check that shows the outcome.

Stories 1.1 to 1.3 predate this layout (a Layer column, no Route column); their `patch, fixed` token sits in the evidence text. Do not restructure them.

## Deferred items

Anything parked instead of fixed is tracked, not just noted. Every deferred item is **one GitHub issue** labelled `deferred`, linked to the story's issue (`Origin: #<story issue>`), with a target date and a remediation suggestion, created before the story's last commit. The story's changelog and security report link to these issues. The process, template, remediation periods and the rules for security exceptions are in [deferred-items.md](deferred-items.md).

## Finishing an epic

Write the release note in `docs/release-notes/` covering integration, changes, new features, security, code quality and test results (new positive and negative tests plus the non-regression suite). Link the epic's story security reports from it.

1. Run the full scan, `./mvnw verify`, the frontend tests and `deploy/release-notes.sh shell-tests`, so the latest reports exist.
2. Generate the note with `deploy/release-notes.sh <epic>`. It fills every fact it can from git, the compose and env files, `images.yaml` and the reports, and marks the rest `TODO(author)`.
3. Write the narrative parts, remove every `TODO(author)`, set `Status: done`, and run `deploy/release-notes.sh check docs/release-notes/epic-NN-<slug>.md`. It fails on a remaining `TODO(author)` or a KEV or High/Critical count other than 0.
   The note is generated before the last PR is squash-merged, so its commit hash does not exist on `main`. Before merging, or in a follow-up docs PR, replace the `Commit` row and the last entry under "Changes" with the squash commit.
4. After the epic's last PR is merged, tag the merge commit on `main` with `deploy/release-notes.sh tag <epic>` (it runs the check first) and push the tag. The next epic's note compares against it.

Details: [release-notes/README.md](release-notes/README.md).
