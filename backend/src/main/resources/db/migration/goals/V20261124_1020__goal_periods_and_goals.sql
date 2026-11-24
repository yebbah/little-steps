-- Story 25.3: Goal Periods and Goals (module goals). Family-owned and tenant-scoped (AD-2).
-- References to the careteam tables are plain ID columns with database foreign keys, never JPA
-- associations (AD-1). Every reference is a composite foreign key with family_id, so a row cannot name
-- another Family's row, and none cascades or nulls: history is never deleted by deleting its parent
-- (only deleting the Family removes it). A Goal's Criterion is a set of columns on the Goal.

CREATE TABLE goal_period (
    id                  uuid PRIMARY KEY,
    family_id           uuid        NOT NULL REFERENCES families ON DELETE CASCADE,
    care_team_member_id uuid        NOT NULL,
    starts_on           date        NOT NULL,
    ends_on             date,
    status              text        NOT NULL CHECK (status IN ('current', 'closed')),
    created_at          timestamptz NOT NULL DEFAULT now(),
    CHECK (ends_on IS NULL OR ends_on >= starts_on),
    UNIQUE (id, family_id),
    FOREIGN KEY (care_team_member_id, family_id) REFERENCES care_team_member (id, family_id)
);

-- A Care Team Member has at most one current Goal Period.
CREATE UNIQUE INDEX goal_period_one_current ON goal_period (care_team_member_id) WHERE status = 'current';

CREATE INDEX goal_period_family ON goal_period (family_id);

CREATE TABLE goal (
    id                        uuid PRIMARY KEY,
    family_id                 uuid        NOT NULL REFERENCES families ON DELETE CASCADE,
    goal_period_id            uuid,
    domain                    text        NOT NULL CHECK (btrim(domain) <> ''),
    description               text        NOT NULL CHECK (btrim(description) <> ''),
    -- AD-10: a typed Source and an origin.
    source_kind               text        NOT NULL CHECK (source_kind IN ('care_team_member', 'caregiver')),
    source_id                 uuid        NOT NULL,
    origin                    text        NOT NULL CHECK (origin IN ('prescribed', 'parent_proposed')),
    original_text             text        NOT NULL CHECK (btrim(original_text) <> ''),
    caregiver_text            text,
    goal_type                 text        NOT NULL CHECK (goal_type IN ('structured', 'narrative')),
    parent_goal_id            uuid,
    context                   text,
    baseline                  text,
    review_status             text        NOT NULL CHECK (review_status IN ('proposed', 'discussed', 'confirmed')),
    proposed_to               uuid,
    revised_from              uuid,
    lineage                   text        NOT NULL DEFAULT 'new' CHECK (lineage IN ('new', 'carried_over', 'revised')),
    retired_at                timestamptz,
    criterion_kind            text        CHECK (criterion_kind IN ('trials', 'duration_minutes', 'count', 'frequency_per_session')),
    criterion_target          integer     CHECK (criterion_target > 0),
    criterion_out_of          integer     CHECK (criterion_out_of > 0),
    criterion_prompt_level_id uuid,
    criterion_context         text,
    created_at                timestamptz NOT NULL DEFAULT now(),
    -- A structured Goal has a Criterion, and a narrative one has none. "out of" is for trials only.
    CONSTRAINT goal_structured_has_criterion CHECK (
        goal_type <> 'structured' OR (criterion_kind IS NOT NULL AND criterion_target IS NOT NULL)),
    CONSTRAINT goal_narrative_has_no_criterion CHECK (
        goal_type <> 'narrative' OR (criterion_kind IS NULL AND criterion_target IS NULL AND criterion_out_of IS NULL
            AND criterion_prompt_level_id IS NULL AND criterion_context IS NULL)),
    CONSTRAINT goal_out_of_only_for_trials CHECK (
        (criterion_kind = 'trials' AND (criterion_out_of IS NULL OR criterion_out_of >= criterion_target))
        OR (criterion_kind IS DISTINCT FROM 'trials' AND criterion_out_of IS NULL)),
    -- AD-10: a Care Team Goal is confirmed; a parent-proposed Goal names who it was proposed to.
    CONSTRAINT goal_prescribed_is_confirmed CHECK (origin <> 'prescribed' OR review_status = 'confirmed'),
    CONSTRAINT goal_parent_proposed_names_member CHECK (origin <> 'parent_proposed' OR proposed_to IS NOT NULL),
    CONSTRAINT goal_source_matches_origin CHECK ((origin = 'prescribed') = (source_kind = 'care_team_member')),
    CONSTRAINT goal_not_its_own_parent CHECK (parent_goal_id IS DISTINCT FROM id AND revised_from IS DISTINCT FROM id),
    CONSTRAINT goal_revised_has_source CHECK (lineage <> 'revised' OR revised_from IS NOT NULL),
    UNIQUE (id, family_id),
    -- A null reference is not checked (MATCH SIMPLE); a set one must be in the same Family.
    FOREIGN KEY (goal_period_id, family_id) REFERENCES goal_period (id, family_id),
    FOREIGN KEY (parent_goal_id, family_id) REFERENCES goal (id, family_id),
    FOREIGN KEY (revised_from, family_id) REFERENCES goal (id, family_id),
    FOREIGN KEY (proposed_to, family_id) REFERENCES care_team_member (id, family_id),
    FOREIGN KEY (criterion_prompt_level_id, family_id) REFERENCES prompt_level (id, family_id)
);

-- original_text is the Care Team's wording and is written once (AD-10).
CREATE FUNCTION goal_original_text_write_once() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.original_text IS DISTINCT FROM OLD.original_text THEN
        RAISE EXCEPTION 'goal.original_text is write-once' USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    RETURN NEW;
END
$$;

CREATE TRIGGER goal_original_text_write_once BEFORE UPDATE ON goal
    FOR EACH ROW EXECUTE FUNCTION goal_original_text_write_once();

CREATE INDEX goal_family ON goal (family_id);
CREATE INDEX goal_period_goals ON goal (goal_period_id);
