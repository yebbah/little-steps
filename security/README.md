# security

Vulnerability scan policy and `exceptions.yaml`: written exceptions with a reason, a mitigation and an expiry of at most 30 days.
The scan itself is `deploy/security-scan.sh` (Story 1.2).

## Blocking rule

A finding blocks the commit when its CVE is in the CISA KEV catalog, or its CVSS is 7.0 or above (High or Critical). A finding with no score that Grype rates High or Critical also blocks. Anything lower passes with a warning.

## Exceptions

The only way past a blocking finding without a fix is when **no fixed version exists**. Add an entry to `exceptions.yaml` with `cve`, `reason`, `mitigation` and `expires` (YYYY-MM-DD, at most 30 days from today). An expired or malformed entry fails the whole scan, and an exception never covers a finding that has a fix: upgrade instead. Every active exception is listed in the epic's release note.
