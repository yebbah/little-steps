# deploy

Dockerfile, `compose.yaml`, `images.yaml`, environment examples, Keycloak realm and bash scripts.
Filled by Stories 1.2 (security scan), 1.3 (compose), 1.4 (start and stop scripts), 1.5 (app image) and 1.9 (release notes script).

## Security scan (Story 1.2)

`security-scan.sh` is the one scan entry point. The git hook (`.githooks/pre-commit`) runs it before every commit, and CI repeats it (Story 1.8).

```bash
deploy/security-scan.sh install-tools   # once: Grype, Syft and gitleaks, pinned, checksums verified, into .tools/
deploy/security-scan.sh                 # scan everything
deploy/tests/security-scan.test.sh      # tests for the scan itself
```

It checks four targets: secrets in staged changes (gitleaks), backend dependencies (CycloneDX SBOM from the Maven plugin), frontend dependencies (`package-lock.json`, dev and transitive included) and every image in `images.yaml`. Each is scanned by Grype. A finding blocks when its CVE is in the CISA KEV catalog or its CVSS is 7.0 or more. Reports land in `build/security/` (`summary.txt`, `report.json`).
`security-policy.jq` holds the blocking rule. See `security/README.md` for exceptions.
