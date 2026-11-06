# Deferred items

How work that is parked instead of fixed is tracked. The rule (one `deferred` issue per item, with an origin, a target date and a remediation) is in [CONTRIBUTING.md](CONTRIBUTING.md#deferred-items); this page is the process and the places involved. The issue is the only place to read the status of an item.

## What counts as deferred

- A review finding routed to "defer" in the story's Review Triage Log.
- A known issue or limitation that ships with the story.
- A warning (below CVSS 7.0, not in KEV) that needs a follow-up, or a fix that exists but is not adopted yet.
- A security exception in `security/exceptions.yaml`.

## Where things live

| Place | Role | Who reads it |
|---|---|---|
| GitHub issue, label `deferred` | The tracker: what, why, remediation, target date, status. One per item. | People |
| `security/exceptions.yaml` | The gate input: one entry per CVE with no fix upstream. Entries cannot carry an issue link, so the file header names the issue. | `deploy/security-scan.sh` |
| `.specs/implementation-artifacts/deferred-work.md` | A thin index: one line per item with the issue number and the target date. No details. | People scanning the backlog |
| Story changelog and security report | Link to the issues, instead of only naming the items. | Reviewers |

## Process

1. **Create the issue** before the story's last commit, from the template `.github/ISSUE_TEMPLATE/deferred.md`. The body starts with `Origin: #<story issue>`. Add the label `deferred`. Add the item to the origin issue's task list, so the story shows its deferred items.
2. **Set the target date** from the table below, and write a remediation: what to change, who owns it (story or epic), and how to tell it is done.
3. **Add one index line** to `deferred-work.md`: `- #<issue>  <target date>  <short title>  (origin #<story issue>)`.
4. **Link the issue** from the story's changelog ("Deferred and known issues") and security report ("Residual risks").
5. **Mark the triage row.** In the story's Review Triage Log, write the issue number in the route of every `defer` row (`defer #65`). Do not write "logged in deferred-work.md": the index has no details and changes.
6. **Close the loop.** When the work is done, close the issue, remove the index line, and (for an exception) delete the entries from `exceptions.yaml`. The epic retrospective reviews every open `deferred` issue whose target date has passed, and the release note lists the ones still open.

## Keeping it fresh (one command, at story finish)

Run it before the last commit and fix any difference: open issues missing from the index, or index lines whose issue is closed.

```sh
diff <(gh issue list -l deferred -s open -L 200 --json number -q '.[].number' | sort -n) \
     <(grep -oE '^- #[0-9]+' .specs/implementation-artifacts/deferred-work.md | tr -dc '0-9\n' | sort -n)
```

Nothing else is rewritten: closed stories keep their spec, changelog and report as written, and the issue is the live status. Only the `defer` route in the triage log gets an issue number (step 5), so a reader can follow it from the frozen record to the live item.

## Suggested remediation periods

Shorten when the item is risky. Lengthen only with a reason written in the issue.

| Kind | Target |
|---|---|
| Security exception (no fix upstream) | Before the exception expires: at most 30 days. Same date as `expires`. |
| Security finding below 7.0, or a published fix not yet adopted | 30 days |
| Correctness or test gap in shipped scripts or code | 60 days, or the story that owns the area if sooner |
| Cleanup, documentation, policy decision | 90 days, or the next epic retrospective |

## Security exceptions: one issue per set

An exception always has a matching `deferred` issue. When several exceptions share one cause (for example 16 CVEs in one image tag), they share **one** issue that lists the CVEs.

- The issue's target date equals the `expires` date of its exceptions.
- The header comment in `security/exceptions.yaml` names the issue, so the file and the tracker can be followed in both directions.
- Renewing an exception means extending `expires` (30 days at most) **and** the issue's target date, with the reason written in the issue. Closing the issue means deleting the entries.
The rules for an exception itself (no fix upstream, reason, mitigation, 30-day expiry) are in [security/README.md](../security/README.md).

## Example

Story 1.3 left 16 unfixed CVEs in the Keycloak image. One issue, "Replace the Keycloak image and remove 16 exceptions", has `Origin: #28`, target date 2026-12-04, and lists the CVEs. `security/exceptions.yaml` carries 16 entries that all expire on 2026-12-04, and its header points at the issue.
