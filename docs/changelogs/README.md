# docs/changelogs

One changelog per story, written when the story is implemented, from [TEMPLATE.md](TEMPLATE.md). The security report of each story is in [../security-reports/](../security-reports/), and each completed epic also gets a release note in [../release-notes/](../release-notes/).

Newest first. Add a line here with every new changelog.

| Story | Title | Changelog |
|---|---|---|
| 2.3 | App shell, navigation and focus management | [story-2-3-app-shell-navigation-and-focus-management.md](story-2-3-app-shell-navigation-and-focus-management.md) |
| 2.11 | Catalog copy for errors, confirmations and security notices | [story-2-11-catalog-copy-for-errors-confirmations-and-security-notices.md](story-2-11-catalog-copy-for-errors-confirmations-and-security-notices.md) |
| 2.4 | Core controls | [story-2-4-core-controls.md](story-2-4-core-controls.md) |
| 2.10 | Catalog copy for status lines, banners and empty states | [story-2-10-catalog-copy-for-status-lines-banners-and-empty-states.md](story-2-10-catalog-copy-for-status-lines-banners-and-empty-states.md) |
| 2.6 | Message catalog and tone check | [story-2-6-message-catalog-and-tone-check.md](story-2-6-message-catalog-and-tone-check.md) |
| 1.6 | Backend module skeleton and persistence baseline | [story-1-6-backend-module-skeleton-and-persistence-baseline.md](story-1-6-backend-module-skeleton-and-persistence-baseline.md) |
| 1.7 | API contract, errors and safe logging | [story-1-7-api-contract-errors-and-safe-logging.md](story-1-7-api-contract-errors-and-safe-logging.md) |
| 1.8 | Continuous integration with security and quality gates | [story-1-8-ci-security-quality-gates.md](story-1-8-ci-security-quality-gates.md) |
| 1.9 | Release notes for each epic | [story-1-9-release-notes-for-each-epic.md](story-1-9-release-notes-for-each-epic.md) |
| 1.5 | Hardened app image and full mode | [story-1-5-hardened-app-image-and-full-mode.md](story-1-5-hardened-app-image-and-full-mode.md) |
| 1.4 | Start and stop scripts | [story-1-4-start-and-stop-scripts.md](story-1-4-start-and-stop-scripts.md) |
| 1.3 | Hardened local infrastructure with Docker Compose | [story-1-3-hardened-local-infrastructure.md](story-1-3-hardened-local-infrastructure.md) |
| 1.2 | Security scan before every commit | [story-1-2-security-scan-before-every-commit.md](story-1-2-security-scan-before-every-commit.md) |
| 1.1 | Scaffold the repository | [story-1-1-scaffold-the-repository.md](story-1-1-scaffold-the-repository.md) |
| 2.1 | Design tokens, theme and type | [story-2-1-design-tokens-theme-and-type.md](story-2-1-design-tokens-theme-and-type.md) |
| 2.2 | Domain tints and icons | [story-2-2-domain-tints-and-icons.md](story-2-2-domain-tints-and-icons.md) |
| 2.5 | Surfaces, feedback and labels | [story-2-5-surfaces-feedback-and-labels.md](story-2-5-surfaces-feedback-and-labels.md) |
| 2.8 | PWA shell and install offer | [story-2-8-pwa-shell-and-install-offer.md](story-2-8-pwa-shell-and-install-offer.md) |
| 2.9 | Settings shell and theme choice | [story-2-9-settings-shell-and-theme-choice.md](story-2-9-settings-shell-and-theme-choice.md) |
| 2.7 | Responsive reflow and accessibility test harness | [story-2-7-responsive-reflow-and-accessibility-test-harness.md](story-2-7-responsive-reflow-and-accessibility-test-harness.md) |

## Non-story pull requests

Fix, CI, spec, test-tooling and chore pull requests have no story, so they get a changelog named `pr-<number>-<slug>.md` from the same [template](TEMPLATE.md) (the Story and Epic rows become Pull request and Kind), and a security report with the same name. The rule is in [CONTRIBUTING.md](../CONTRIBUTING.md#non-story-pull-requests); pull requests that only add these records are exempt. Newest first.

| PR | Title | Changelog | Security report |
|---|---|---|---|
| #168 | Time-limit the latest-image lookup in the security scan | [pr-168-latest-image-lookup-timeout.md](pr-168-latest-image-lookup-timeout.md) | [report](../security-reports/pr-168-latest-image-lookup-timeout.md) |
| #166 | Retry the pinned scan tool download when GitHub releases answer 5xx | [pr-166-scan-tool-download-retry.md](pr-166-scan-tool-download-retry.md) | [report](../security-reports/pr-166-scan-tool-download-retry.md) |
| #164 | Bump the Keycloak 26.8.2 digest to the current image | [pr-164-keycloak-digest-bump.md](pr-164-keycloak-digest-bump.md) | [report](../security-reports/pr-164-keycloak-digest-bump.md) |
| #162 | Update the deferred-work index | [pr-162-deferred-work-index-update.md](pr-162-deferred-work-index-update.md) | [report](../security-reports/pr-162-deferred-work-index-update.md) |
| #161 | Nightly Chromium, WebKit and Firefox run on the built bundle | [pr-161-nightly-browser-run.md](pr-161-nightly-browser-run.md) | [report](../security-reports/pr-161-nightly-browser-run.md) |
| #160 | Release-notes check fails a stale story status and a Commit hash not on main | [pr-160-release-note-bookkeeping-check.md](pr-160-release-note-bookkeeping-check.md) | [report](../security-reports/pr-160-release-note-bookkeeping-check.md) |
| #159 | Enforce an 80% frontend coverage floor in Vitest | [pr-159-frontend-coverage-floor.md](pr-159-frontend-coverage-floor.md) | [report](../security-reports/pr-159-frontend-coverage-floor.md) |
| #157 | Spec the nightly browser run, coverage floor and release-note bookkeeping check; drop R7 | [pr-157-spec-nightly-coverage-floor-release-note-check.md](pr-157-spec-nightly-coverage-floor-release-note-check.md) | [report](../security-reports/pr-157-spec-nightly-coverage-floor-release-note-check.md) |
| #156 | Return focus to the clicked invoker when the browser does not focus buttons on click | [pr-156-modal-returns-focus-to-clicked-invoker.md](pr-156-modal-returns-focus-to-clicked-invoker.md) | [report](../security-reports/pr-156-modal-returns-focus-to-clicked-invoker.md) |
| #155 | Retry the dhi.io login when the registry is unavailable | [pr-155-dhi-login-retry.md](pr-155-dhi-login-retry.md) | [report](../security-reports/pr-155-dhi-login-retry.md) |
| #153 | Playwright refuses a stale server unless asked to reuse one | [pr-153-playwright-refuses-stale-server.md](pr-153-playwright-refuses-stale-server.md) | [report](../security-reports/pr-153-playwright-refuses-stale-server.md) |
| #152 | Mandatory OpenAPI drift check and required backend test reports | [pr-152-mandatory-openapi-drift-and-test-reports.md](pr-152-mandatory-openapi-drift-and-test-reports.md) | [report](../security-reports/pr-152-mandatory-openapi-drift-and-test-reports.md) |
| #149 | Surfaces never imports shell, enforced by lint | [pr-149-surfaces-never-imports-shell.md](pr-149-surfaces-never-imports-shell.md) | [report](../security-reports/pr-149-surfaces-never-imports-shell.md) |
| #148 | Spec the Epic 2 retrospective follow-ups | [pr-148-spec-epic-2-retro-follow-ups.md](pr-148-spec-epic-2-retro-follow-ups.md) | [report](../security-reports/pr-148-spec-epic-2-retro-follow-ups.md) |
| #147 | Base image zlib CVE, and images count a fix only from the latest image | [pr-147-base-image-zlib-cve-and-latest-image-rule.md](pr-147-base-image-zlib-cve-and-latest-image-rule.md) | [report](../security-reports/pr-147-base-image-zlib-cve-and-latest-image-rule.md) |
