# Global tables

Tables that have no tenant-scoped `family_id` (AD-2). An entity mapped without `@TenantId` must be listed here, and `GlobalTablesTests` fails if it is not; every other table is Family-owned and tenant-scoped.

## Listed tables

| Table | Why it is global |
|---|---|
| `families` | The tenant itself. Read to resolve a Caregiver's Family. |
| `caregivers` | A Caregiver exists before and across Families. |
| `caregiver_membership` | Read before a tenant exists, to find the Caregiver's active Family. It keeps its `family_id` column. |

A story that adds a global table (curated content, tombstones, `pilot_metric`, `invite` before acceptance) adds it here in the same change.

## Not Family data, and not listed

Two tables belong to libraries, not to a module: `flyway_schema_history` (Flyway) and `event_publication` (the Spring Modulith event publication registry, created by `db/migration/shared/V20261106_1000__event_publication_registry.sql`). They hold no Family content: event payloads carry IDs only (AD-1).
