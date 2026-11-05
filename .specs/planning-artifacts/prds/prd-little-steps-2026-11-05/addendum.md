# LittleSteps PRD — Addendum

This addendum holds detail that belongs in downstream documents, such as the architecture and UX specs, rather than in the PRD. It contains no personal data.

## A. Proposed technology (from the idea brief; proposals, not decisions)
- **Frontend:** Next.js PWA.
- **Backend:** Python/FastAPI.
- **Data:** PostgreSQL, plus private object storage for files.
- **Hosting and jobs:** Google Cloud Run, with Cloud Scheduler for background jobs.
- **AI orchestration:** the OpenAI Agents SDK, as the brief proposes.
- The brief prefers explicit workflows and structured data, with tightly controlled AI tool use, over a multi-agent design.
- **For architecture to weigh:** for a small pilot, a lighter stack may be enough, such as a single Next.js app with managed Postgres and auth. Choose the AI provider and model during the architecture step.

## B. Mobile / PWA considerations
- **Push notifications:** on iOS and iPadOS 16.4 and later, web push works only after the user adds the PWA to the home screen. This affects the optional reminders in FR-13.
- **Storage eviction:** iOS Safari can delete stored data for PWAs that go unused for a long time. Local drafts kept for the offline-tolerant logging NFR therefore need to sync to the server promptly.
- **Sharing:** the Web Share API can open the device share sheet for exporting Summaries (FR-17).
- **Voice notes:** rely on the device's built-in keyboard dictation, so no audio is recorded or stored.

## C. Data-model hints from common therapy document formats
- **SLP goal sheets:** often a Domain → Long-Term Goal → Short-Term Goal table, with no goal IDs, reissued each goal period (often quarterly).
  - Criterion types seen: X/Y trials, duration, count of new items, and frequency per session.
  - The prompt condition and the setting are usually written into the goal sentence itself.
- **OT reports:** often broad narrative goals ("Support X Learning") measured against a baseline from the initial consultation.
  - Progress is described in narrative phrases such as "evident", "developing", and "emerging".
  - Parent-reported observations are commonly cited as evidence.
- **Status vocabularies:** a common set is Achieved / Achieved in [context] / Partially achieved / Not yet presented. The product needs a context qualifier on "achieved".
- **Common home strategies (seeds for Coach Tips and the starter Activity set):**
  - Adapting repeated scripts by changing 1–2 words to fit the situation.
  - Sensory play actions: press, trace, squeeze, pop, blow.
  - Movement-based engagement.
  - Modelling with repeated exposure.
- **Report headers:** metadata in imported reports can contain errors, so every imported field must be editable (FR-5).
- **Sessions and pricing:** sessions are usually paid per session and per discipline, which limits how often they happen. Home practice between sessions is where most repetition takes place. A session/package counter was considered and deferred.

## D. Starter Coach Tips (seed content)
**Shared reading:**
- The caregiver holds the book and controls the pace.
- Sit face to face at the child's eye level.
- Sing a familiar song about a picture.
- Let the child turn the page after a shared look.
- Keep sessions to a few pages.
