# docs/security-reports

One security report per story, from [TEMPLATE.md](TEMPLATE.md), named `story-<N>-<M>-<slug>.md`. The stories are listed in [../changelogs/README.md](../changelogs/README.md), and each completed epic's release note in [../release-notes/](../release-notes/) links to its stories' reports.

## Non-story pull requests

Pull requests that are not stories get a report named `pr-<number>-<slug>.md` from the same template. The scan numbers come from the CI "Security scan" job on the pull request's head commit (container images are scanned by the pre-commit hook, not in CI). The rule is in [CONTRIBUTING.md](../CONTRIBUTING.md#non-story-pull-requests). Newest first.

| PR | Title | Report |
|---|---|---|
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
