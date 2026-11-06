# LittleSteps: agent instructions

Full policies are in [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md). Read it before changing code.

## Where things live

- Specs, PRD, UX, architecture and epics: `.specs/` (planning artifacts under `.specs/planning-artifacts/`, SPEC at `.specs/specs/spec-little-steps/SPEC.md`). Input brief and project context: `.ideas/`.
- Stack: Java/Spring Boot backend, React + Vite PWA, PostgreSQL (JPA/Flyway), Keycloak (OIDC), Spring AI (Ollama locally), Docker Compose + Mailpit. Runs end-to-end locally on a Mac. Prefer Java over Python.
- Specs and docs describe a global product. No references to specific families, children or other personal details.

## Rules

- **Branching:** every branch is cut from an up-to-date `main` and merged back to `main` by PR, whatever its level (epic, issue or sub-issue). Names: `feature/epic-<NN>-<slug>`, `feature/epic-<NN>-issue-<N>-<slug>`, `feature/epic-<NN>-issue-<N>-sub-<M>-<slug>`. Squash-merge PRs; never force-push shared branches.
- **Security:** every commit passes `deploy/security-scan.sh`. Fix any CISA KEV or CVSS >= 7.0 finding before committing. Never use `--no-verify`. Use Grype, not Trivy. Pin GitHub Actions to commit SHAs. Use `dhi.io` images when available.
- **Finishing a story:** produce the review pass, changelog and security report BEFORE asking the human to validate or decide anything. Steps: independent three-reviewer pass (blind, edge cases, verification gaps), then a changelog, a security report and any README updates, all before the last commit. Then push and close the story's issue.
- **Deferred items:** every deferred item (review defer, known issue, follow-up warning, security exception) is one GitHub issue labelled `deferred`, linked to the issue of the story where it arose, with a target date and a remediation suggestion. The issue is the tracker; `deferred-work.md` is a thin index; exceptions sharing a cause share one issue. See docs/deferred-items.md.
- **Finishing an epic:** release note in `docs/release-notes/`.
- Never document steps that do not exist yet; mark them "arrives with Story X".
