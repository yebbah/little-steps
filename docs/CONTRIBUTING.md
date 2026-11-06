# Contributing to LittleSteps

Project policies for everyone working in this repo, human or AI. They apply whatever tool or framework drives the work.

## Documentation

Prefer linking to an existing document over repeating its content. Each rule or fact lives in one place; every other document links to it. Before writing a rule or fact, search the docs for where it already lives, and add it there. This file is the source for project policies.

## Issues

- Epic N is GitHub issue #N+1, labelled `epic` plus `P1` or `P2`.
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
