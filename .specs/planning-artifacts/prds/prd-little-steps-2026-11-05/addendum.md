# LittleSteps PRD — Addendum

This addendum holds detail that belongs in downstream documents, such as the architecture and UX specs, rather than in the PRD. It contains no personal data.

## A. Technology direction (product-owner decisions, 2026-11-05)
These choices replace the idea brief's original proposals (Python/FastAPI, managed PostgreSQL, Cloud Run, OpenAI Agents SDK). Architecture should treat them as constraints and settle the remaining choices.

**Guiding constraint:** the full product, AI included, must run end to end on a Mac for development and testing, at no cost. Where it is hosted for real users is decided at launch. Every component is therefore a standard container or protocol, so it can move to cheap hosting without code changes.

### A.1 Environments
| Layer | Local: development and testing (now) | Shipping (decided at launch) |
|---|---|---|
| Backend | Spring Boot, run from the IDE | The same app, in a container |
| Database | PostgreSQL in Docker, behind JPA and Flyway | The same container on a small server with nightly backups, or a free-tier hosted Postgres |
| Auth | Keycloak in Docker | The same Keycloak container |
| Email (invites, password resets) | Mailpit in Docker, which catches all mail locally | A transactional email service (free tiers exist) |
| AI | Ollama or LM Studio, installed natively on macOS so it can use the Apple Silicon GPU | A low-cost hosted model, switched by Spring AI configuration and kept within the PRD §10 cost ceiling |
| Files | Local folder, behind a storage interface | S3-compatible object storage |
| Frontend | React + Vite PWA, with hot reload | Static build served by Spring Boot, or Cloudflare Pages (free) |
| Testing on a real device | Tailscale (free personal plan), which gives phones an HTTPS address for the Mac | A real domain with HTTPS |

A likely shipping shape is one small VM running the same Compose file with a hosted AI model, at roughly US$5–10 a month in total. This is indicative only.

Notes for architecture:
- **HTTPS.** Service workers and PWA install need HTTPS on every device except `localhost`. Phones therefore need the Tailscale (or equivalent) HTTPS endpoint to test against the Mac.
- **Push.** Web push works from a local server, because the server only makes outbound calls to browser push services. Reminders only send while the Mac is awake.
- **AI parity.** The guardrail evaluation set (≥30 cases, PRD §10) runs against the local model and the hosted model alike.

### A.2 Backend: Java and Spring Boot
- Java with Spring Boot, chosen because the product owner knows it.
- REST API, Spring Security, and Spring Data JPA.
- **Background jobs:** Spring's scheduler, for reminders, retention deletion, and the pilot-end data schedule. No cloud scheduler is needed.

### A.3 Data: portable through an ORM
- All persistence goes through **Spring Data JPA (Hibernate)**, with **Flyway** migrations in portable SQL. The database behind it can change without changing application code.
- **Recommended default: PostgreSQL running in a container.**
  - PostgreSQL itself is free. The cost comes from managed cloud hosting (e.g. Cloud SQL), not from the database.
  - A container on the Mac, or on the same small VM when shipping, costs nothing extra. It also fits the relational data well: Goal lineage, Observations, and the audit log.
- **Lighter alternatives:**
  - SQLite: a single file, no server. Good for one Family, weaker for concurrent writes, and supported in Hibernate only through a community dialect.
  - H2: for tests.
  - A free-tier serverless Postgres, as a shipping option.
- **Firebase (Firestore) was considered and not chosen** (see A.9).
- **File storage:** a storage interface with a local-filesystem implementation (local) and an S3-compatible implementation (shipping). Files are encrypted at rest. The 12-month retention timer (PRD §10) runs as a scheduled job inside the app.

### A.4 Authentication: Keycloak (OIDC)
- Keycloak is the identity provider in a container, both locally and when shipping. The PWA signs in with OIDC (authorization code with PKCE), and Spring Boot validates tokens as an OAuth2 resource server.
- **Keycloak owns identity:** accounts, passwords, and login.
- **The app owns everything else:** Family membership, invites, consent records, and the audit log (PRD FR-1, §5).
- The code depends only on standard OIDC, so a lighter provider (e.g. Authentik or Zitadel) could replace Keycloak. Keycloak needs about 512 MB–1 GB of RAM.

### A.5 AI: provider-agnostic (local for development, hosted when shipping)
- **Spring AI**, behind one internal "AI port" interface, so the model can be swapped by configuration.
  - **Local:** Ollama or LM Studio running natively on macOS, to use the Apple Silicon GPU. Docker on a Mac cannot use the GPU.
  - **Hosted:** any provider that Spring AI supports (OpenAI, Anthropic, Gemini, and others).
- **Benefits of local models:**
  - No per-request cost.
  - Child data never leaves the Mac, which strengthens PRD §5.
- **Costs of local models:**
  - Small models are weaker at extracting structured data from documents, and at the scope checks. FR-5 import must stay review-first, and the guardrail test set (≥30 cases, PRD §10) must pass with whichever model is configured.
  - A 7–8B model needs a Mac with roughly 16 GB of RAM or more.
- **Document text extraction (OCR):** Tesseract, or a vision-capable model. Identifier masking (§E, optionally with Presidio; see A.8) runs before any model call, in both environments.
- **Coach Tips (FR-12)** must still appear in under 2 seconds. The curated starter tips are served from the database and never wait on a local model.

### A.6 Frontend
- **React + Vite**, built as a PWA (e.g. with vite-plugin-pwa).
- It builds to static files, which Spring Boot can serve. Next.js's main advantage is server-side rendering, and the Spring Boot backend already does the server-side work, so Next.js adds complexity without benefit here.

### A.7 Local packaging
Setting up the local environment is in v1 scope (spec CAP-19, architecture AD-22), and it is built first.
- `deploy/dev-up.sh` starts PostgreSQL, Keycloak with its realm imported, and Mailpit (plus Presidio, once it is adopted; see A.8), then waits until they are healthy.
  - It first checks the prerequisites (Docker, Java, Node, Ollama and the configured model) and says how to fix anything missing.
  - It is safe to run twice.
  - `--full` also builds and runs the app container image.
- `deploy/dev-down.sh` stops everything and keeps the data. `--wipe` resets the volumes and local files.
- One `deploy/Dockerfile` builds the app image (the PWA plus Spring Boot). The same image is used when shipping.
- For day-to-day work, Spring Boot and the Vite dev server run outside Docker, for debugging and hot reload. The AI model runtime runs natively on the Mac.
- The README covers the one-time setup with these commands, plus Tailscale for testing on a device.

### A.8 Identifier masking library (option)
- **Microsoft Presidio** is open source (Python) and is one of the strongest tools for detecting and masking PII such as names, dates of birth, addresses, and ID numbers.
- It can run as one more container that Spring Boot calls over HTTP, so no Python enters the main codebase. It is a strong candidate for FR-5 masking (§E), because the Java options are weaker.

### A.9 Considered and not chosen
- **Firebase (Firestore).** A Google cloud service: production is cloud-only, and the local Emulator Suite is for development only, which conflicts with the local-first constraint. As a NoSQL database it fits the relational Goal and Observation data poorly, and it locks the product into Google.
- **Vercel.** It hosts frontends and Node, Python, Go, or Ruby functions, and cannot run Spring Boot, Keycloak, PostgreSQL, or a local model. The free Hobby plan is for non-commercial use only, and Pro is roughly US$20 per member per month. It would also split the local setup.
- **Next.js + FastAPI.** It means two server runtimes and two languages, with no infrastructure saved: PostgreSQL, Keycloak, AI, and email stay the same. The product owner knows Java. If minimal infrastructure ever becomes the priority, the better alternative is a single full-stack Next.js app, not Next.js + FastAPI.
- **The brief's original stack** (Python/FastAPI, managed PostgreSQL on Cloud SQL, Cloud Run, OpenAI Agents SDK). It was replaced for cost, familiarity, and local-first reasons.

## B. Browser & device considerations
**No browser is assumed.** Caregivers can use Chrome, Safari, Firefox, Edge, Samsung Internet, or another current browser on their phone, tablet, or computer. Design and test against the current versions of all of these.

- **iOS and iPadOS:**
  - Every browser on iOS, Chrome included, runs on Apple's WebKit engine. So the iOS limits below apply whichever browser the caregiver uses.
  - Since iOS 16.4, web push works only after the PWA is added to the home screen and the user grants permission, so the in-app Today nudge is the default (FR-13).
  - WebKit can clear stored data for web apps left unused for a long time, so drafts kept offline must sync promptly.
  - iOS does not support the Web Share Target API, so an installed PWA cannot receive content from the share sheet. For FR-5 and FR-7, iOS relies on photo and screenshot upload and pasting from the clipboard.
- **Android, in Chrome, Edge, or Samsung Internet:**
  - Install prompts and push work without special steps.
  - Share-target import is possible later.
  - Firefox on Android supports push but has limited install support.
- **Desktop:** Chrome and Edge can install the PWA. Safari on macOS 14 and later can add it to the Dock. Firefox runs it as a normal website. Every feature must work without installing.
- **Install and permission prompts** follow each browser's own pattern. The app detects what the browser supports rather than checking which browser it is.
- **Sharing:** the Web Share API opens the device share sheet for Summaries (FR-17). Where it isn't available, PDF download is the fallback.
- **Voice notes:** use the device's built-in keyboard dictation, so no audio is recorded or stored.

## C. Data-model hints from common therapy document formats
- **SLP goal sheets:** often a Domain → Long-Term Goal → Short-Term Goal table, with no goal IDs, reissued each Goal Period (often quarterly).
  - Criterion types seen: X/Y trials, duration, count of new items, and frequency per session.
  - The Prompt Level and Context are usually written into the goal sentence itself.
- **OT reports:** often broad narrative goals (e.g. "support play participation") measured against a baseline from the initial consultation.
  - Progress is described in narrative phrases such as "evident", "developing", and "emerging".
  - Parent-reported observations are commonly cited as evidence.
- **Status Vocabularies:** a common set is Achieved / Achieved in [context] / Partially achieved / Not yet presented. The product therefore needs a Context qualifier on "Achieved".
- **Common home strategies (seeds for Coach Tips and the starter Activity set):**
  - Adapting repeated scripts by changing 1–2 words to fit the situation.
  - Sensory play actions: press, trace, squeeze, pop, blow.
  - Movement-based engagement.
  - Modelling with repeated exposure.
- **Report headers:** metadata in imported reports can contain errors, so every imported field must be editable (FR-5).
- **Therapy sessions and pricing:** therapy is usually paid per session and per discipline, which limits how often sessions happen. Home practice between them is where most repetition takes place. A session/package counter was considered and deferred.

## D. Starter Coach Tips (seed content)
**Shared reading:**
- The caregiver holds the book and controls the pace.
- Sit face to face at the child's eye level.
- Sing a familiar song about a picture.
- Let the child turn the page after a shared look.
- Keep each Practice Session to a few pages.

## E. Masking, guardrails and observability (for architecture)
- **Identifier masking (FR-5):** detect identifiers on the device or server before any AI call. Good candidates are OCR followed by pattern and named-entity detection: names, dates, phone numbers, addresses, ID numbers, and clinic letterheads. The Caregiver then confirms or adjusts the result.
  - Only the masked text or image is sent to the AI provider.
  - The unmasked original goes to private object storage, with a retention timer (12 months; PRD §10).
- **Restriction checks (FR-9, FR-12):** put a deterministic check of each suggestion against the recorded Restrictions in front of model output, plus a scope classifier for "general engagement technique".
  - Keep the evaluation set (at least 30 cases; PRD §10) in the repo, and run it in CI before every pilot release.
- **Observability (PRD §6):** use structured logs, traces, and AI evaluation metrics, such as Restriction-check failures, "check with your therapist" rate, and tip helpfulness. Logs carry IDs only, never child content or identifiers.
- **Audit log (PRD §5):** append-only, scoped to the Family, and readable by its Caregivers.
