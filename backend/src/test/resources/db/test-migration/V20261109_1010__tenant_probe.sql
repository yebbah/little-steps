-- Test-only (Story 25.1): proves @TenantId isolation until real Family-owned tables exist.
CREATE TABLE tenant_probe (
    id        uuid PRIMARY KEY,
    family_id uuid NOT NULL REFERENCES families ON DELETE CASCADE,
    label     text NOT NULL
);
