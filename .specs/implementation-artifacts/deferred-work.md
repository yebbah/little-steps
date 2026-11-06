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
