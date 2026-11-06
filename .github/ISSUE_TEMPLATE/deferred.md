---
name: Deferred item
about: Work parked from a story (review finding, known issue, accepted warning, or expiring security exception)
labels: deferred
---

Origin: #<issue number of the story where this arose>

## What is deferred

<One or two sentences. Name the file, image or CVE.>

## Why it was deferred

<Evidence: what was found, who found it, why it was not fixed in the story.>

## Remediation

<What to change, which story or epic should do it, and how to tell it is done.>

## Target date

<YYYY-MM-DD. See docs/deferred-items.md for the suggested periods.>

## Security exception (delete this section if none)

- Exceptions covered: <CVE ids in security/exceptions.yaml>
- `expires` in security/exceptions.yaml: <same date as the target date above>
- Closing this issue means deleting those entries.
