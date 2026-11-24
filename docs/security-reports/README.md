# docs/security-reports

One security report per story, from [TEMPLATE.md](TEMPLATE.md), named `story-<N>-<M>-<slug>.md`. The stories are listed in [../changelogs/README.md](../changelogs/README.md), and each completed epic's release note in [../release-notes/](../release-notes/) links to its stories' reports.

## Non-story pull requests

Every pull request that is not a story carries a report in the same pull request, from the same template: `change-<branch slug>.md` (up to #171 the reports are named `pr-<number>-<slug>.md`). The numbers come from the local scan of the branch (`build/security/summary.txt`), or, for the records written after the merge, from the CI "Security scan" job on the pull request's head commit; container images are scanned by the pre-commit hook, not in CI. CI fails a pull request without a record. The rule is in [CONTRIBUTING.md](../CONTRIBUTING.md#non-story-pull-requests). Newest first.

| PR | Title | Report |
|---|---|---|
| chore | Bump the PostgreSQL 18-alpine digest to the current image | [change-bump-postgres-digest.md](change-bump-postgres-digest.md) |
| epic 25 | Demo Family first, setup features later (Epic 25 stories) | [change-epic-25-stories.md](change-epic-25-stories.md) |
| issue #172 | Backfill changelogs and security reports for the older non-story pull requests | [change-epic-02-issue-172-records-backfill.md](change-epic-02-issue-172-records-backfill.md) |
| issue #172 | Records travel in the same pull request, enforced by CI | [change-epic-02-issue-172-records-in-same-pr.md](change-epic-02-issue-172-records-in-same-pr.md) |
| #171 | Exempt records-only pull requests from the changelog and security report rule | [pr-171-records-only-prs-exempt.md](pr-171-records-only-prs-exempt.md) |
| #169 | Changelogs and security reports for the non-story pull requests | [pr-169-changelogs-and-security-reports-for-non-story-prs.md](pr-169-changelogs-and-security-reports-for-non-story-prs.md) |
| #168 | Time-limit the latest-image lookup in the security scan | [pr-168-latest-image-lookup-timeout.md](pr-168-latest-image-lookup-timeout.md) |
| #166 | Retry the pinned scan tool download when GitHub releases answer 5xx | [pr-166-scan-tool-download-retry.md](pr-166-scan-tool-download-retry.md) |
| #164 | Bump the Keycloak 26.8.2 digest to the current image | [pr-164-keycloak-digest-bump.md](pr-164-keycloak-digest-bump.md) |
| #162 | Update the deferred-work index | [pr-162-deferred-work-index-update.md](pr-162-deferred-work-index-update.md) |
| #161 | Nightly Chromium, WebKit and Firefox run on the built bundle | [pr-161-nightly-browser-run.md](pr-161-nightly-browser-run.md) |
| #160 | Release-notes check fails a stale story status and a Commit hash not on main | [pr-160-release-note-bookkeeping-check.md](pr-160-release-note-bookkeeping-check.md) |
| #159 | Enforce an 80% frontend coverage floor in Vitest | [pr-159-frontend-coverage-floor.md](pr-159-frontend-coverage-floor.md) |
| #157 | Spec the nightly browser run, coverage floor and release-note bookkeeping check; drop R7 | [pr-157-spec-nightly-coverage-floor-release-note-check.md](pr-157-spec-nightly-coverage-floor-release-note-check.md) |
| #156 | Return focus to the clicked invoker when the browser does not focus buttons on click | [pr-156-modal-returns-focus-to-clicked-invoker.md](pr-156-modal-returns-focus-to-clicked-invoker.md) |
| #155 | Retry the dhi.io login when the registry is unavailable | [pr-155-dhi-login-retry.md](pr-155-dhi-login-retry.md) |
| #153 | Playwright refuses a stale server unless asked to reuse one | [pr-153-playwright-refuses-stale-server.md](pr-153-playwright-refuses-stale-server.md) |
| #152 | Mandatory OpenAPI drift check and required backend test reports | [pr-152-mandatory-openapi-drift-and-test-reports.md](pr-152-mandatory-openapi-drift-and-test-reports.md) |
| #149 | Surfaces never imports shell, enforced by lint | [pr-149-surfaces-never-imports-shell.md](pr-149-surfaces-never-imports-shell.md) |
| #148 | Spec the Epic 2 retrospective follow-ups | [pr-148-spec-epic-2-retro-follow-ups.md](pr-148-spec-epic-2-retro-follow-ups.md) |
| #147 | Base image zlib CVE, and images count a fix only from the latest image | [pr-147-base-image-zlib-cve-and-latest-image-rule.md](pr-147-base-image-zlib-cve-and-latest-image-rule.md) |
| #142 | Record the Epic 2 squash commit in the release note | [pr-142-epic-2-release-note-commit.md](pr-142-epic-2-release-note-commit.md) |
| #141 | Epic 2 acceptance, retrospective, release note and Story 2.2 spec reconciliation | [pr-141-epic-2-acceptance-retro-release-note.md](pr-141-epic-2-acceptance-retro-release-note.md) |
| #140 | Fix Epic 2 code review findings | [pr-140-epic-2-code-review-fixes.md](pr-140-epic-2-code-review-fixes.md) |
| #123 | BMAD setup and new-workspace steps | [pr-123-bmad-setup.md](pr-123-bmad-setup.md) |
| #122 | Keep Test Architect outputs in the repo | [pr-122-test-architect-outputs-in-repo.md](pr-122-test-architect-outputs-in-repo.md) |
| #121 | Update sprint status action item T2 | [pr-121-sprint-status-action-item-t2.md](pr-121-sprint-status-action-item-t2.md) |
| #109 | Epic 2 test framework and red-phase tests for R-01 to R-04 | [pr-109-epic-2-test-framework.md](pr-109-epic-2-test-framework.md) |
| #108 | Epic 2 spec update (gallery, Settings shell, router, copy catalog split, Epic 24) | [pr-108-epic-2-spec-update.md](pr-108-epic-2-spec-update.md) |
| #103 | Epic 1 retrospective and close-out fixes | [pr-103-epic-1-retrospective-and-close-out.md](pr-103-epic-1-retrospective-and-close-out.md) |
| #100 | Fix workflow documentation drift | [pr-100-workflow-documentation-drift-fixes.md](pr-100-workflow-documentation-drift-fixes.md) |
| #99 | Sync specs with the code (spec drift audit) | [pr-99-spec-drift-sync.md](pr-99-spec-drift-sync.md) |
| #98 | Spec-first policy, CI policy and workflow decision trees | [pr-98-spec-first-ci-policy-and-workflow-trees.md](pr-98-spec-first-ci-policy-and-workflow-trees.md) |
| #78 | Add infrastructure and component architecture diagrams | [pr-78-architecture-diagrams.md](pr-78-architecture-diagrams.md) |
| #77 | Deferred index sync, scan cadence and triage log format | [pr-77-deferred-index-sync-scan-cadence-triage-log.md](pr-77-deferred-index-sync-scan-cadence-triage-log.md) |
| #64 | Make CONTRIBUTING.md the single source for policies | [pr-64-single-source-policies.md](pr-64-single-source-policies.md) |
| #63 | Refresh the README and require a README review in every story | [pr-63-readme-every-story.md](pr-63-readme-every-story.md) |
| #55 | Add project policies (AGENTS.md, CLAUDE.md, CONTRIBUTING.md) | [pr-55-project-policies.md](pr-55-project-policies.md) |
| #43 | Add Epic 3 stories: sign-in, Family and consent | [pr-43-epic-3-stories.md](pr-43-epic-3-stories.md) |
| #25 | LittleSteps v1 planning set: PRD, UX, architecture, spec and epics | [pr-25-v1-planning-set.md](pr-25-v1-planning-set.md) |
| #1 | Revise PRD UJ-1 to a prep, activity, review flow | [pr-1-prd-uj-1-prep-activity-review.md](pr-1-prd-uj-1-prep-activity-review.md) |
