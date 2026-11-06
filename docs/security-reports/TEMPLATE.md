# Security report: Story {N.M}, {story title}

<!--
One report per story, from this template, in docs/security-reports/story-{N}-{M}-{slug}.md.
Fill every section; write "None" or "Not applicable (reason)" rather than deleting one.
Take the numbers from build/security/summary.txt and report.json, not from memory.
The repository is public: no personal data, no absolute local paths, no secret values.
Epic release notes (docs/release-notes/) link to the reports of their stories.
-->

| | |
|---|---|
| Story | {N.M}, issue #{issue} |
| Branch | {branch} |
| Commit scanned | {full commit hash} |
| Date | {YYYY-MM-DD} |
| Verdict | {PASS / PASS WITH WARNINGS / FAIL} |

## 1. Summary

{Two or three sentences: what the story changed from a security point of view, and the verdict.}

## 2. Scan result

Scan tool versions: Grype {x}, Syft {x}, gitleaks {x}. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | {PASS/FAIL} | {n} | {n} |
| Backend dependencies | {n} | {PASS/FAIL/SKIP} | {n} | {n} |
| Frontend dependencies | {n} | {PASS/FAIL/SKIP} | {n} | {n} |
| Container images | {n} | {PASS/FAIL/SKIP} | {n} | {n} |

### Warnings (below 7.0, not in KEV)

| Package | Version | CVE | CVSS | Fixed in | Decision |
|---|---|---|---|---|---|
| {name} | {version} | {CVE} | {score} | {version or none} | {accepted until X / upgrade planned in story Y} |

## 3. Exceptions

{Every active entry in security/exceptions.yaml: CVE, reason, mitigation, expiry. "None" if empty.}

## 4. Container images

| Image | Source (dhi or other) | Digest | Why not DHI (if other) |
|---|---|---|---|
| {name} | {source} | {digest} | {reason} |

Images from outside Docker Hardened Images are warnings in the release note: {None / list}.

## 5. Supply chain

{Tools and actions this story added or changed: how each is pinned and verified (version, checksum, commit SHA). "None" if no change.}

## 6. Secrets and data handling

{Result of the secret scan. Anything this story logs, stores or sends that could carry child data. "No change" if nothing.}

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | {command} | {n passed} |
| New negative tests | {command} | {n passed} |
| Non-regression suite | {command} | {n passed, 0 failed} |

## 8. Review findings with security impact

{Findings from the reviewer pass that touched security, each with its verdict and what was done. Link the story spec's Review Triage Log.}

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| {item} | {what could go wrong} | {story or "accepted"} |

## 10. Sign-off

{Reviewer, date, and the decision to merge or to hold.}
