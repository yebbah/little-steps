# UI review checklist

Banned UI patterns (UX-DR115) and the wording rules that go with them (UX-DR135, UX-DR136). Use it when reviewing any screen or component, and tick it in the review of every feature story. Each feature epic's release note links to this file under "Code quality".

## Banned patterns

A change fails review if it adds any of these:

- [ ] **Streaks**: counts of consecutive days or sessions.
- [ ] **Scores**: points, ratings or "8/10" style results, for the child or the Caregiver.
- [ ] **Badges**: awards, levels or collectible marks.
- [ ] **Confetti or celebration animations.**
- [ ] **Visible countdowns or target timers.**
- [ ] **App-icon unread counters.**
- [ ] **Autoplay media.**
- [ ] **Nags after dismissal**: a dismissed notice or offer does not come back unprompted.
- [ ] **An AI chat interface.**
- [ ] **An on-screen coach during play.**

## Wording

- [ ] Every sentence comes from the message catalog (`frontend/src/i18n/messages.ts`) by key; none is inline in JSX.
- [ ] The tone check passes (`npm test` in `frontend/`, also run by CI). It rejects "Missed", "Session failed", "Insufficient data", "No progress", "Network error", "Error 500", "Something went wrong", "Great job" and "/10" scores.
- [ ] Wording is warm, short and plain, and never judges the Caregiver or the child.
- [ ] AI items carry the AI-suggested label and parent-proposed Goals carry the proposed-by-you label (`label.aiSuggested`, `label.proposedByYou`).

The tone check catches banned phrases only; the rest of this list is verified by the reviewer.
