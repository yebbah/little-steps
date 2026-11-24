-- Story 25.4: Strategies and Restrictions (module goals). Family-owned and tenant-scoped (AD-2).
-- Same rules as Story 25.3: every reference to a row (Goal, Restriction) is a composite foreign key with
-- family_id, a reference to a Goal refuses the delete (no cascade), original_text is write-once (AD-10), and
-- origin and source agree. source_id is a typed reference (a Care Team Member or a Caregiver, by source_kind)
-- and has no key, so it is not enforced across Families, as with goal.source_id.
-- Only the avoid terms, an owned part of a Restriction, go with it.

CREATE FUNCTION original_text_write_once() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.original_text IS DISTINCT FROM OLD.original_text THEN
        RAISE EXCEPTION '%.original_text is write-once', TG_TABLE_NAME USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    RETURN NEW;
END
$$;

-- A Strategy belongs to a Goal.
CREATE TABLE strategy (
    id             uuid PRIMARY KEY,
    family_id      uuid        NOT NULL REFERENCES families ON DELETE CASCADE,
    goal_id        uuid        NOT NULL,
    source_kind    text        NOT NULL CHECK (source_kind IN ('care_team_member', 'caregiver')),
    source_id      uuid        NOT NULL,
    origin         text        NOT NULL CHECK (origin IN ('prescribed', 'parent_proposed')),
    original_text  text        NOT NULL CHECK (btrim(original_text) <> ''),
    caregiver_text text        CHECK (caregiver_text IS NULL OR btrim(caregiver_text) <> ''),
    retired_at     timestamptz,
    created_at     timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT strategy_source_matches_origin CHECK ((origin = 'prescribed') = (source_kind = 'care_team_member')),
    UNIQUE (id, family_id),
    FOREIGN KEY (goal_id, family_id) REFERENCES goal (id, family_id)
);

CREATE TRIGGER strategy_original_text_write_once BEFORE UPDATE ON strategy
    FOR EACH ROW EXECUTE FUNCTION original_text_write_once();

CREATE INDEX strategy_family ON strategy (family_id);
CREATE INDEX strategy_goal ON strategy (goal_id);

-- A Restriction belongs to a Goal or, with no Goal, to the Family. A retired one no longer applies.
CREATE TABLE restriction (
    id             uuid PRIMARY KEY,
    family_id      uuid        NOT NULL REFERENCES families ON DELETE CASCADE,
    goal_id        uuid,
    source_kind    text        NOT NULL CHECK (source_kind IN ('care_team_member', 'caregiver')),
    source_id      uuid        NOT NULL,
    origin         text        NOT NULL CHECK (origin IN ('prescribed', 'parent_proposed')),
    original_text  text        NOT NULL CHECK (btrim(original_text) <> ''),
    caregiver_text text        CHECK (caregiver_text IS NULL OR btrim(caregiver_text) <> ''),
    retired_at     timestamptz,
    created_at     timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT restriction_source_matches_origin CHECK ((origin = 'prescribed') = (source_kind = 'care_team_member')),
    UNIQUE (id, family_id),
    -- A null Goal is not checked (MATCH SIMPLE): a Family-level Restriction.
    FOREIGN KEY (goal_id, family_id) REFERENCES goal (id, family_id)
);

CREATE TRIGGER restriction_original_text_write_once BEFORE UPDATE ON restriction
    FOR EACH ROW EXECUTE FUNCTION original_text_write_once();

CREATE INDEX restriction_family ON restriction (family_id);
CREATE INDEX restriction_goal ON restriction (goal_id);

-- Zero or more phrases a Restriction names to avoid, one row each.
CREATE TABLE restriction_avoid_term (
    id             uuid PRIMARY KEY,
    family_id      uuid        NOT NULL REFERENCES families ON DELETE CASCADE,
    restriction_id uuid        NOT NULL,
    ordinal        integer     NOT NULL,
    term           text        NOT NULL CHECK (btrim(term) <> ''),
    created_at     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (restriction_id, ordinal),
    -- An owned part: it goes with its Restriction, and cannot name another Family's.
    FOREIGN KEY (restriction_id, family_id) REFERENCES restriction (id, family_id) ON DELETE CASCADE
);

CREATE INDEX restriction_avoid_term_family ON restriction_avoid_term (family_id);
