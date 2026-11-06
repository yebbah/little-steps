# LittleSteps: agent instructions

All project policies are in [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md), the single source. Read it before changing code, and do not restate its rules here or in other docs: link to it.

## Where things live

- Specs, PRD, UX, architecture and epics: `.specs/` (planning artifacts under `.specs/planning-artifacts/`, SPEC at `.specs/specs/spec-little-steps/SPEC.md`). Input brief and project context: `.ideas/`.
- Stack: Java/Spring Boot backend, React + Vite PWA, PostgreSQL (JPA/Flyway), Keycloak (OIDC), Spring AI (Ollama locally), Docker Compose + Mailpit. Runs end-to-end locally on a Mac. Prefer Java over Python.
- Specs and docs describe a global product. No references to specific families, children or other personal details.
