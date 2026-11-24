-- Story 25.3: Care Team Members, the Family's ordered Prompt Levels, each member's Status
-- Vocabulary and an optional per-member Prompt Level mapping (module careteam). Family-owned and
-- tenant-scoped (AD-2). A Prompt Level or Status Vocabulary item is retired, never deleted.

CREATE TABLE care_team_member (
    id           uuid PRIMARY KEY,
    family_id    uuid        NOT NULL REFERENCES families ON DELETE CASCADE,
    role         text        NOT NULL CHECK (btrim(role) <> ''),
    discipline   text,
    care_setting text        NOT NULL CHECK (care_setting IN ('clinic', 'school', 'home_visit', 'online')),
    created_at   timestamptz NOT NULL DEFAULT now(),
    UNIQUE (id, family_id)
);

CREATE INDEX care_team_member_family ON care_team_member (family_id);

CREATE TABLE prompt_level (
    id         uuid PRIMARY KEY,
    family_id  uuid        NOT NULL REFERENCES families ON DELETE CASCADE,
    ordinal    integer     NOT NULL,
    label      text        NOT NULL CHECK (btrim(label) <> ''),
    retired_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (id, family_id)
);

-- The order is the Family's own; a retired level gives its place up.
CREATE UNIQUE INDEX prompt_level_active_ordinal ON prompt_level (family_id, ordinal) WHERE retired_at IS NULL;

CREATE TABLE status_vocabulary_item (
    id                  uuid PRIMARY KEY,
    family_id           uuid        NOT NULL REFERENCES families ON DELETE CASCADE,
    care_team_member_id uuid        NOT NULL,
    ordinal             integer     NOT NULL,
    label               text        NOT NULL CHECK (btrim(label) <> ''),
    retired_at          timestamptz,
    created_at          timestamptz NOT NULL DEFAULT now(),
    -- Composite foreign keys: a row cannot name another Family's parent. An owned part of its member.
    FOREIGN KEY (care_team_member_id, family_id) REFERENCES care_team_member (id, family_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX status_vocabulary_item_active_ordinal
    ON status_vocabulary_item (care_team_member_id, ordinal) WHERE retired_at IS NULL;

-- The member's own label for one of the Family's Prompt Levels.
CREATE TABLE care_team_member_prompt_level (
    id                  uuid PRIMARY KEY,
    family_id           uuid        NOT NULL REFERENCES families ON DELETE CASCADE,
    care_team_member_id uuid        NOT NULL,
    prompt_level_id     uuid        NOT NULL,
    label               text        NOT NULL CHECK (btrim(label) <> ''),
    created_at          timestamptz NOT NULL DEFAULT now(),
    UNIQUE (care_team_member_id, prompt_level_id),
    -- An owned part of its member; a Prompt Level in use is never deleted (it is retired).
    FOREIGN KEY (care_team_member_id, family_id) REFERENCES care_team_member (id, family_id) ON DELETE CASCADE,
    FOREIGN KEY (prompt_level_id, family_id) REFERENCES prompt_level (id, family_id)
);
