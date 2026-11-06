# Contributing to LittleSteps

Project policies for everyone working in this repo, human or AI. They apply whatever tool or framework drives the work.

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
- Each branch is merged into `main` by PR. Merge a story before starting the next story that depends on it.
- Write `Closes #N` in a PR body for the issue that PR completes. The epic's issue is closed only when the whole epic is done.
- PRs are squash-merged. Never force-push a shared branch.

## Security gate

- Every commit must pass `deploy/security-scan.sh` (pre-commit hook in `.githooks/` and CI).
- Any CVE that is in the CISA KEV catalog, or has a CVSS of 7.0 or more (High or Critical), must be fixed before committing.
- Never use `--no-verify`.
- Use Grype for scanning, not Trivy. Pin GitHub Actions to commit SHAs.
- Container images come from Docker Hardened Images (`dhi.io`) when the catalog has them. An image from elsewhere is listed as a warning in the epic's release note.
- Background: AD-25, AD-26 and AD-27 in the architecture spine, NFR-20 to NFR-22, and the epic Definition of done.

## Finishing a story

Before a story's last commit:

**Order rule:** produce the review pass, changelog and security report first, then ask the human to validate. Never ask for validation, a decision or a sign-off on a story before those three artifacts exist. If a blocker remains (for example a failing scan), the security report records it as the verdict and the open decision, so the human reviews the full picture in one go. Fill sections that depend on a later step (such as review findings) as soon as that step is done; do not hand over a report with "pending" sections when the step can be run.

1. Run an independent review pass with three separate reviewers: blind (diff only), edge cases, and verification gaps. Triage every finding with evidence, fix the real ones, and record the triage in the story's spec or review log. A self-review does not replace this.
2. Write the changelog: `docs/changelogs/story-<N>-<M>-<slug>.md` from `docs/changelogs/TEMPLATE.md`, plus a row in the index in that folder. Changelogs are per story, not per epic.
3. Write the security report: `docs/security-reports/story-<N>-<M>-<slug>.md` from `docs/security-reports/TEMPLATE.md`. Fill every section, with numbers from `build/security/summary.txt` and `report.json`. Security reports are per story, not per epic.
4. Review and update `README.md` in every story, whether or not the story seems to touch it: check Prerequisites, Setup, Development, Release, Deployment, Layout and Versions against the code and the story's changes, and fix anything stale. Record each section touched, or "reviewed, no change", in the changelog's Operations impact table. Mark steps that do not exist yet as "arrives with Story X"; never document what does not exist.
5. Log every deferred item as a GitHub issue (see "Deferred items" below) before pushing.
6. Push the branch and close the story's issue with a short comment (commit, result, links to the deferred issues).

## Deferred items

Anything parked instead of fixed is tracked, not just noted: review findings routed to defer, known issues, accepted warnings that need a follow-up, and security exceptions. Full process, template and example: [deferred-items.md](deferred-items.md).

1. **One GitHub issue per deferred item**, labelled `deferred`, created before the story's last commit from `.github/ISSUE_TEMPLATE/deferred.md`. The body starts with `Origin: #<story issue>`, and the origin issue lists it in its task list. The issue is the only place to read status.
2. **Every issue carries a target date and a remediation suggestion** (what to change, who owns it, how to tell it is done). Use the suggested periods in deferred-items.md: exceptions before they expire (30 days at most), findings below 7.0 or unadopted fixes 30 days, correctness or test gaps 60 days, cleanup and policy 90 days.
3. **Security exceptions share one issue per cause** (for example one image tag with 16 CVEs). The issue's target date equals the exceptions' `expires`, and the header of `security/exceptions.yaml` names the issue. Closing the issue means deleting the entries.
4. **`.specs/implementation-artifacts/deferred-work.md` is a thin index**: one line per item with the issue number and target date, no details.
5. **Close the loop**: close the issue, remove the index line (and the exceptions). The epic retrospective reviews every open `deferred` issue past its target date, and the release note lists those still open.
6. The story's changelog and security report link to the deferred issues.

## Finishing an epic

Write the release note in `docs/release-notes/` covering integration, changes, new features, security, code quality and test results (new positive and negative tests plus the non-regression suite). Link the epic's story security reports from it.
