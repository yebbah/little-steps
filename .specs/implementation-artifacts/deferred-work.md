- source_spec: `.specs/implementation-artifacts/spec-1-1-scaffold-the-repository.md`
  summary: Add a CI check that the backend build fails with the enforcer message on a JDK other than 25.
  evidence: Party review of Story 1.1 agreed to park the wrong-JDK negative test until CI exists (Story 1.8).
- source_spec: `.specs/implementation-artifacts/spec-1-1-scaffold-the-repository.md`
  summary: Story 1.2 first scan run must cover the lockfiles committed in Story 1.1.
  evidence: Story 1.1 lands before the scan gate exists.
