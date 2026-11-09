# security

Vulnerability scan policy and `exceptions.yaml`: written exceptions with a reason, a mitigation and an expiry of at most 30 days.
The scan itself is `deploy/security-scan.sh` (Story 1.2).

## Blocking rule

A finding blocks the commit when its CVE is in the CISA KEV catalog, or its CVSS is 7.0 or above (High or Critical). A finding with no score that Grype rates High or Critical also blocks. Anything lower passes with a warning.

## Exceptions

The only way past a blocking finding without a fix is when **no fix is available**. For a library or package in the dependency scans, that means no fixed version exists. For a container image, a fixed version of the library does not count by itself: the fix must be in the **latest available image** of the pinned tag. If the pinned digest is not the tag's latest digest, upgrade the pin. If it is the latest and the library fix has not reached it, the finding has no fix yet. Add an entry to `exceptions.yaml` with `cve`, `reason`, `mitigation` and `expires` (YYYY-MM-DD, at most 30 days from today). An expired or malformed entry fails the whole scan, and an exception never covers a finding that has a fix available: upgrade instead. When the scanner cannot look up the tag's latest digest, it treats the library fix as available (it fails closed). A lookup that does not answer within 30 seconds (`LS_LOOKUP_TIMEOUT`) counts as failed, so a slow registry cannot hang a commit. Every active exception is listed in the epic's release note.
