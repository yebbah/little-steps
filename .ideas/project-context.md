# LittleSteps Project Context

## Product
LittleSteps is an AI-powered, parent-first home therapy and developmental progress companion. It helps families turn therapist-guided developmental goals into engaging home activities, practice them flexibly, record observations, and share useful summaries with therapists. Its tagline is “Small activities. Meaningful progress.” The product supports professional care; it does not replace therapists or make diagnoses.

The product brief in `brief.md` is the primary source of product context. When requirements are unclear, preserve the principles in that brief and avoid inventing clinical claims or capabilities.

## Users and focus
- Primary: parents and caregivers of toddlers and young children receiving speech-language or developmental therapy.
- Secondary: speech-language therapists, occupational therapists, and early-intervention professionals.
- Initial goals focus on speech, communication, social interaction, and emotional regulation.

## Core workflow
Keep the end-to-end journey coherent: **Set Goal → Discover Activities → Plan → Practice → Observe → Review → Refine**.

The MVP centers on child profiles and preferences, developmental goal management, therapist-instruction entry, goal-aligned activity recommendations, guided practice, flexible scheduling, quick observation logging, goal-level progress views, and basic therapist summaries.

## Product and clinical guardrails
- Keep therapist-guided goals and parent-proposed goals distinguishable, including their source and review/approval status.
- Recommendations should align with verified goals, therapist guidance, restrictions, child interests, available materials, and family constraints.
- Do not present AI-generated suggestions as diagnosis, treatment decisions, or a substitute for professional judgment. Flag clinical decisions and unreviewed suggestions appropriately.
- Progress features should describe recorded observations and their context, not infer unsupported developmental outcomes or treatment effectiveness.
- Favor positive, flexible caregiver-child interaction. Activities must be easy to pause, skip, adapt, or stop; missed practice must not create a backlog or guilt.
- Minimize child and family data. Design for consent, access control, encryption, auditability, and deletion; avoid collecting sensitive data without a clear need.

## Engineering context
The brief proposes a mobile-friendly web application, with Next.js/PWA frontend, Python/FastAPI backend, PostgreSQL, private object storage, Google Cloud Run, scheduled/background processing, and OpenAI Agents SDK. These are proposed choices, not confirmed implementation constraints; inspect the existing project before choosing or adding technologies.

Prefer explicit workflows, structured data, and controlled AI tool use over unnecessary multi-agent complexity. Keep observations and progress data traceable to their source and context. Build accessible, responsive experiences with caregiver-friendly language and low-friction interactions.

## Implementation guidance
- Treat `brief.md` as product intent, not as evidence that a feature or architecture already exists.
- Preserve the distinction between practice consistency, observed skill performance, and generalization across settings.
- Make uncertainty visible in AI-generated summaries; ground summaries in recorded data and avoid overstating trends.
- Keep the interface supportive and nonjudgmental. Optimize common actions such as finding an activity and logging a typical observation for speed.
- Before adding dependencies, infrastructure, or data fields, check the existing codebase and justify the added complexity.
