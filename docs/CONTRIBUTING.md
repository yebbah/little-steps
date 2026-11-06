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

One branch per level of the issue hierarchy: epic, issue (story) and sub-issue. Each branch is cut from its parent's branch, and the epic branch is cut from an up-to-date `main`.

| Level | Name | Cut from |
|---|---|---|
| Epic | `feature/epic-<NN>-<slug>` | `main` |
| Issue (story) | `feature/epic-<NN>-issue-<N>-<slug>` | the epic branch |
| Sub-issue | `feature/epic-<NN>-issue-<N>-sub-<M>-<slug>` | the issue branch |

Example: `feature/epic-01-issue-2-local-environment`.

- Update the parent first (`git checkout <parent> && git pull`), then branch.
- Each branch is merged into its parent by PR; the epic branch is merged into `main`.
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

1. Run an independent review pass with three separate reviewers: blind (diff only), edge cases, and verification gaps. Triage every finding with evidence, fix the real ones, and record the triage in the story's spec or review log. A self-review does not replace this.
2. Write the changelog: `docs/changelogs/story-<N>-<M>-<slug>.md` from `docs/changelogs/TEMPLATE.md`, plus a row in the index in that folder. Changelogs are per story, not per epic.
3. Write the security report: `docs/security-reports/story-<N>-<M>-<slug>.md` from `docs/security-reports/TEMPLATE.md`. Fill every section, with numbers from `build/security/summary.txt` and `report.json`. Security reports are per story, not per epic.
4. Update the README Setup, Development, Release and Deployment sections if the story changed them. Mark steps that do not exist yet as "arrives with Story X"; never document what does not exist.
5. Push the branch and close the story's issue with a short comment (commit, result, anything deferred).

## Finishing an epic

Write the release note in `docs/release-notes/` covering integration, changes, new features, security, code quality and test results (new positive and negative tests plus the non-regression suite). Link the epic's story security reports from it.
