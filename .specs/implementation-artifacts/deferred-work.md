- source_spec: `.specs/implementation-artifacts/spec-1-1-scaffold-the-repository.md`
  summary: Add a CI check that the backend build fails with the enforcer message on a JDK other than 25.
  evidence: Party review of Story 1.1 agreed to park the wrong-JDK negative test until CI exists (Story 1.8).
- source_spec: `.specs/implementation-artifacts/spec-1-1-scaffold-the-repository.md`
  summary: Story 1.2 first scan run must cover the lockfiles committed in Story 1.1.
  evidence: Story 1.1 lands before the scan gate exists.
- source_spec: `.specs/implementation-artifacts/spec-1-2-security-scan-before-every-commit.md`
  summary: Make CI (Story 1.8) assert that no LS_* test override (LS_KEV_FILE, LS_TOOLS_DIR, LS_ROOT, LS_IMAGES_FILE, LS_SCAN_TODAY) is set when the scan runs.
  evidence: The overrides replace scan inputs in the production path; a stub tools directory or an empty KEV file would weaken the scan (reviewer finding, unverified in CI).
- source_spec: `.specs/implementation-artifacts/spec-1-2-security-scan-before-every-commit.md`
  summary: Add a package or target scope to security/exceptions.yaml entries.
  evidence: An exception is keyed by CVE only, so it silences that CVE in every package, image and target.
- source_spec: `.specs/implementation-artifacts/spec-1-2-security-scan-before-every-commit.md`
  summary: Decide whether a finding with no score and Unknown severity should block.
  evidence: It passes as a warning today; the approved rule only names KEV and CVSS 7.0 or above.
- source_spec: `.specs/implementation-artifacts/spec-1-2-security-scan-before-every-commit.md`
  summary: Include the secrets target and failed targets in build/security/report.json, and show real component counts for image targets.
  evidence: report.json lists only targets that reached the policy step; image counts show vulnerable artifacts only.
- source_spec: `.specs/implementation-artifacts/spec-1-2-security-scan-before-every-commit.md`
  summary: Story 1.4's dev-up.sh must set core.hooksPath to .githooks, and the hook may need a fast path for commits that touch no dependency files.
  evidence: The hook is inactive in a fresh clone until hooksPath is set.

# Index of deferred items that have a GitHub issue (see docs/deferred-items.md).
# The issue is the tracker; this list is only an index. Format: issue, target date, title (origin).
- #56  2026-12-04  Replace the Keycloak image and remove 16 security exceptions  (origin #28, Story 1.3)
- #57  2026-12-06  Bump Presidio image digests, CVE-2026-115557 fix not yet published  (origin #28, Story 1.3)
- #58  2027-02-04  Remove `scan: deferred` from the Presidio entries when Epic 18 enables them  (origin #28, Story 1.3)
- #59  2027-01-05  Recheck the Keycloak bash /dev/tcp healthcheck on DHI image updates  (origin #28, Story 1.3)
- #60  2027-01-05  Automated stack smoke test: health, schema, PKCE token, Mailpit email  (origin #28, Story 1.3)
- #61  2027-01-05  check-images.sh orphan, duplicate and digest-format checks  (origin #28, Story 1.3)
- #65  2027-01-05  dev-up.sh does not check jq, git or a Compose version with --wait-timeout  (origin #29, Story 1.4)
- #66  2027-01-05  Verify dev-up.sh health reporting against real docker compose ps output  (origin #29, Story 1.4)
