# Changelog: Bump the PostgreSQL 18-alpine digest to the current image

| | |
|---|---|
| Issue | none (a pin upgrade required by the security gate) |
| Kind | Fix (image pin); not a story |
| Origin | The pre-commit scan blocked every commit: the pinned PostgreSQL image reports KEV and High findings in krb5-libs and libxslt that the current image does not |
| Branch | chore/bump-postgres-digest |
| Pull request | the one opened from this branch (its number is in the squash commit title and in the index) |
| Date | 2026-11-11 |
| Size | 2 files, +3 −3 |
| Security report | [change-bump-postgres-digest.md](../security-reports/change-bump-postgres-digest.md) |

## Summary

The `18-alpine` tag moved to a new image without the krb5-libs findings (CVE-2026-107778, -112314, -112320 to -112323, -119079, -40355, -40356) and the libxslt findings (CVE-2026-125350, which is in the CISA KEV catalog, and CVE-2026-87636). Under the image-fix rule (AD-25) the pin is upgraded, as in #164 for Keycloak.

## Added

None.

## Changed

- The PostgreSQL digest is `sha256:0cdbc51a…` in `deploy/images.yaml` and `deploy/compose.yaml` (same tag).

## Fixed

- The pre-commit scan block on the PostgreSQL image (KEV CVE-2026-125350, and CVSS 7.1 to 8.8 findings).

## Removed or deprecated

None.

## Security

The new image scans clean (0 components flagged; `RESULT: PASS`). Details and scan numbers are in the [security report](../security-reports/change-bump-postgres-digest.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | No change |
| Release | No change |
| Deployment | The PostgreSQL image digest changed. |

README section(s) concerned: Not applicable. README.md was not changed in this pull request.

## After you pull

Run `deploy/dev-down.sh` then `deploy/dev-up.sh` to pull the new PostgreSQL image. The data volume is kept, since the major version is the same (18).

## Tests

`deploy/check-images.sh`: compose and manifest agree. `deploy/security-scan.sh`: `RESULT: PASS`, PostgreSQL image clean, other images unchanged.

## Deferred and known issues

None.
