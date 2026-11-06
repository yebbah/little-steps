# Changelog: Story 1.8, Continuous integration with security and quality gates

| | |
|---|---|
| Story | 1.8, issue #33 |
| Epic | 1, Local environment and project skeleton |
| Branch | feature/epic-01-issue-33-ci-security-quality-gates |
| Commits | see the Story 1.8 commit on the branch (baseline f66e007) |
| Date | 2026-11-06 |
| Security report | [story-1-8-ci-security-quality-gates.md](../security-reports/story-1-8-ci-security-quality-gates.md) |

## Summary

Every push and pull request is now checked by `.github/workflows/ci.yml` on free GitHub-hosted runners: backend build and tests with coverage, frontend lint, typecheck, tests and build, script and manifest checks, and the security scan over the commit history and the backend and frontend dependencies. Image scans stay manual (#95). A skipped local hook no longer lets an unsafe or broken change through.

## Added

- `.github/workflows/ci.yml` with four jobs (Backend, Frontend, Scripts, Security). Steps are named for what they check; reports are uploaded as build artifacts (`backend-reports`, `frontend-reports`, `security-reports`); Maven, npm and the Grype database are cached.
- `deploy/check-actions.sh`: fails on any action referenced by tag, branch or short SHA, or without a version comment. Tests: `deploy/tests/check-actions.test.sh` (positive and negative).
- `deploy/tests/ci-workflow.test.sh`: fails when the workflow loses a required step, a step name, the badge or the `guardrail-eval` exclusion.
- `LS_SECRETS_SCOPE=history` for `deploy/security-scan.sh secrets`, so CI scans the commit history (nothing is staged there). Unknown values and shallow clones are refused.
- JaCoCo coverage in `./mvnw verify` (`backend/target/site/jacoco/`); surefire excludes the `guardrail-eval` tag (wired up in Epic 13).
- Frontend `typecheck`, `test` and `test:coverage` scripts, Vitest 5.1.0 with coverage-v8 and one smoke test.
- README: status badge and a "Continuous integration" section.

## Changed

- `docs/CONTRIBUTING.md` points to `deploy/check-actions.sh` for the action pinning rule. README Development, Release and Layout updated.

## Fixed

- Review findings (cache poisoning risk, vacuous secret scan on a mistyped scope, double CI runs, blind spots in the pin check): see the triage log in the story spec.

## Removed or deprecated

None.

## Security

Verdict PASS WITH WARNINGS; see [the security report](../security-reports/story-1-8-ci-security-quality-gates.md). Actions are pinned to commit SHAs, the scan tools and KEV feed are never cached, the workflow token is read-only.

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | Add the repository secrets `DHI_USERNAME` and `DHI_TOKEN` once; otherwise the Backend job fails at the login step (the integration tests pull the PostgreSQL image) | Continuous integration |
| Development | New commands: `npm run typecheck`, `npm run test:coverage`, `deploy/check-actions.sh`; shellcheck also covers `.githooks/*` | Development |
| Release | CI uploads scan and test reports for the release note; the app image build and image scans are manual; publishing is still not available | Release |
| Deployment | No change (reviewed). Prerequisites, Setup, Layout and Versions reviewed; Layout updated | Deployment, Layout, Versions |

## After you pull

1. `(cd frontend && npm ci)` for Vitest.
2. Add the `DHI_USERNAME` and `DHI_TOKEN` repository secrets and, if wanted, require the four CI jobs under Settings, Branches.
3. After merge: keep #69 open (image scans are not in CI, see #95) and close #73 (CI asserts no `LS_*` override is set); both are done by this story.

## Tests

- New positive and negative: `deploy/tests/check-actions.test.sh` (17), `deploy/tests/ci-workflow.test.sh`, history-scope and scope-validation cases in `deploy/tests/security-scan.test.sh`, `frontend/src/App.test.tsx`.
- Non-regression: `./mvnw verify` (11 tests), `npm run lint`, `typecheck`, `test:coverage`, `build`, all `deploy/tests/*.test.sh`, `shellcheck`, actionlint 1.7.7 on the workflow, `deploy/check-images.sh`.
- The workflow has not run on GitHub yet; its first run needs the secrets above.

## Deferred and known issues

- [#95](https://github.com/yebbah/little-steps/issues/95): run image scans in CI as a scheduled or release job
- [#88](https://github.com/yebbah/little-steps/issues/88): make the OpenAPI drift check, ModularityTests and Testcontainers mandatory in CI once Stories 1.6 and 1.7 merge.
- [#89](https://github.com/yebbah/little-steps/issues/89): coverage thresholds.
- [#90](https://github.com/yebbah/little-steps/issues/90): fork and Dependabot PR policy, PR-scoped secret scan.
- Known: the OpenAPI drift step reports a notice and skips until `api:check` exists (Story 1.7).
