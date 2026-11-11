-- Test-only (Story 25.2): the store behind PUT /api/v1/dev/echo/{id}, which exercises the outbox end to end.
CREATE TABLE dev_echo (
    id        uuid PRIMARY KEY,
    family_id uuid NOT NULL REFERENCES families ON DELETE CASCADE,
    body      text NOT NULL
);
