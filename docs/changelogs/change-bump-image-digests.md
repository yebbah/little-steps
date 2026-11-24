# Changelog: Bump every pinned image to its current version, and add the OpenSSL exceptions

| | |
|---|---|
| Issue | #189 (the deferred re-check), unblocks #180 |
| Kind | Fix (image pins and security exceptions); not a story |
| Origin | New CVEs were published and the pre-commit scan blocked every commit; the pinned images had newer versions with fixes, and nine OpenSSL CVEs have no fix upstream |
| Branch | chore/bump-image-digests |
| Pull request | the one opened from this branch (its number is in the squash commit title and in the index) |
| Date | 2026-11-24 |
| Size | 6 files |
| Security report | [change-bump-image-digests.md](../security-reports/change-bump-image-digests.md) |

## Summary

All pinned images moved to the current image of their tag (the image-fix rule, AD-25): PostgreSQL, Keycloak, the Node and Temurin build stages, the Temurin runtime, and Mailpit from v1.33.0 to v1.34.0. That removed the findings that had a fix, and the runtime image now passes outright. Nine OpenSSL 3.5.9 CVEs remain with no fixed library in any latest image, so they have written 30-day exceptions and a deferred issue.

## Added

- Nine exception entries in `security/exceptions.yaml` (CVE-2026-107493, -107494, -107496, -121482, -124709, -84786, -88823, -95691, -95692), expiring 2026-12-24.
- Deferred issue #189 to re-check them, and its index line.

## Changed

- Digests in `deploy/images.yaml`, `deploy/compose.yaml` and `deploy/Dockerfile`; Mailpit tag `v1.34.0`.

## Fixed

- The pre-commit scan block on the pinned images (libc6, libpq, libxslt and other findings that the current images fix).

## Removed or deprecated

None.

## Security

The scan passes. The exceptions cover local-development containers and build stages that are never deployed. Details are in the [security report](../security-reports/change-bump-image-digests.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | New image versions; Mailpit is v1.34.0 |
| Release | The nine active exceptions go in the release note of the epic that is closed while they are active |
| Deployment | No change (the images are never deployed) |

README section(s) concerned: Not applicable. README.md was not changed in this pull request.

## After you pull

Run `deploy/dev-down.sh` then `deploy/dev-up.sh` to pull the new images. Data volumes are kept (same PostgreSQL major version).

## Tests

`deploy/check-images.sh`: compose, Dockerfile and manifest agree. `deploy/security-scan.sh`: `RESULT: PASS`, with every image passing.

## Deferred and known issues

- #189: re-check the nine OpenSSL exceptions by 2026-12-24.
- The older Keycloak exceptions from #56 remain until they expire on 2026-12-04.
