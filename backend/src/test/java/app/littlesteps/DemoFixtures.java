package app.littlesteps;

import java.time.Instant;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;

/** Inserts Families, Caregivers and memberships directly, since nothing in the app seeds data yet. */
public final class DemoFixtures {

	private static final Instant BASE = Instant.parse("2026-01-01T00:00:00Z");

	private final JdbcTemplate jdbc;

	public DemoFixtures(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	public void reset() {
		jdbc.update("delete from goal");
		jdbc.update("delete from goal_period");
		jdbc.update("delete from care_team_member_prompt_level");
		jdbc.update("delete from status_vocabulary_item");
		jdbc.update("delete from prompt_level");
		jdbc.update("delete from care_team_member");
		jdbc.update("delete from child_sensitivity");
		jdbc.update("delete from child_profile");
		jdbc.update("delete from tenant_probe");
		jdbc.update("delete from dev_echo");
		jdbc.update("delete from caregiver_membership");
		jdbc.update("delete from caregivers");
		jdbc.update("delete from families");
	}

	public UUID family(UUID id) {
		jdbc.update("insert into families (id, timezone) values (?, 'Europe/Paris')", id);
		return id;
	}

	/** {@code order} makes created_at deterministic: a lower order is created earlier. */
	public UUID caregiver(UUID id, String sub, String displayName, int order) {
		jdbc.update("insert into caregivers (id, sub, display_name, email, created_at) values (?, ?, ?, ?, ?)", id, sub,
				displayName, sub + "@example.invalid", java.sql.Timestamp.from(BASE.plusSeconds(order)));
		return id;
	}

	public void member(UUID caregiverId, UUID familyId) {
		jdbc.update("insert into caregiver_membership (id, caregiver_id, family_id) values (?, ?, ?)",
				app.littlesteps.shared.domain.Uuids.v7(), caregiverId, familyId);
	}

	public void endMembership(UUID caregiverId) {
		jdbc.update("update caregiver_membership set ended_at = now(), end_reason = 'left' where caregiver_id = ?",
				caregiverId);
	}

	private static UUID id() {
		return app.littlesteps.shared.domain.Uuids.v7();
	}

	private static java.sql.Timestamp at(int order) {
		return java.sql.Timestamp.from(BASE.plusSeconds(order));
	}

	public UUID childProfile(UUID familyId, String nickname) {
		UUID id = id();
		jdbc.update("insert into child_profile (id, family_id, nickname, age_band, interests, materials, engagement_notes)"
				+ " values (?, ?, ?, 'early years', 'trains', 'blocks', 'likes short turns')", id, familyId, nickname);
		return id;
	}

	public UUID sensitivity(UUID familyId, UUID profileId, int ordinal, String text, boolean avoid) {
		UUID id = id();
		jdbc.update("insert into child_sensitivity (id, family_id, child_profile_id, ordinal, text, avoid)"
				+ " values (?, ?, ?, ?, ?, ?)", id, familyId, profileId, ordinal, text, avoid);
		return id;
	}

	/** {@code order} makes created_at deterministic: a lower order is created earlier. */
	public UUID careTeamMember(UUID familyId, String role, String careSetting, int order) {
		UUID id = id();
		jdbc.update("insert into care_team_member (id, family_id, role, discipline, care_setting, created_at)"
				+ " values (?, ?, ?, 'speech', ?, ?)", id, familyId, role, careSetting, at(order));
		return id;
	}

	public UUID promptLevel(UUID familyId, int ordinal, String label, boolean retired) {
		UUID id = id();
		jdbc.update("insert into prompt_level (id, family_id, ordinal, label, retired_at) values (?, ?, ?, ?, ?)", id,
				familyId, ordinal, label, retired ? at(99) : null);
		return id;
	}

	public UUID statusWord(UUID familyId, UUID memberId, int ordinal, String label, boolean retired) {
		UUID id = id();
		jdbc.update("insert into status_vocabulary_item (id, family_id, care_team_member_id, ordinal, label, retired_at)"
				+ " values (?, ?, ?, ?, ?, ?)", id, familyId, memberId, ordinal, label, retired ? at(99) : null);
		return id;
	}

	public void memberPromptLevel(UUID familyId, UUID memberId, UUID levelId, String label) {
		jdbc.update("insert into care_team_member_prompt_level (id, family_id, care_team_member_id, prompt_level_id, label)"
				+ " values (?, ?, ?, ?, ?)", id(), familyId, memberId, levelId, label);
	}

	public UUID goalPeriod(UUID familyId, UUID memberId, String startsOn, String status) {
		UUID id = id();
		jdbc.update("insert into goal_period (id, family_id, care_team_member_id, starts_on, status)"
				+ " values (?, ?, ?, ?::date, ?)", id, familyId, memberId, startsOn, status);
		return id;
	}

	/** A Care Team Goal: prescribed, confirmed, with the given type and criterion (null kind for narrative). */
	public UUID prescribedGoal(UUID familyId, UUID periodId, UUID memberId, String type, String criterionKind,
			Integer target, Integer outOf, UUID promptLevelId, int order) {
		return goal(familyId, periodId, memberId, "prescribed", "confirmed", null, type, criterionKind, target, outOf,
				promptLevelId, order);
	}

	/** The general insert, so a test can try a row the database must refuse. */
	public UUID goal(UUID familyId, UUID periodId, UUID sourceId, String origin, String reviewStatus, UUID proposedTo,
			String type, String criterionKind, Integer target, Integer outOf, UUID promptLevelId, int order) {
		UUID id = id();
		jdbc.update("insert into goal (id, family_id, goal_period_id, domain, description, source_kind, source_id, origin,"
				+ " original_text, goal_type, review_status, proposed_to, criterion_kind, criterion_target, criterion_out_of,"
				+ " criterion_prompt_level_id, created_at) values (?, ?, ?, 'communication', 'a goal', ?, ?, ?,"
				+ " 'original wording', ?, ?, ?, ?, ?, ?, ?, ?)", id, familyId, periodId,
				"prescribed".equals(origin) ? "care_team_member" : "caregiver", sourceId, origin, type, reviewStatus,
				proposedTo, criterionKind, target, outOf, promptLevelId, at(order));
		return id;
	}

	/** Inserts a goal from valid narrative defaults overridden by {@code cols} (a null value stores null). */
	public UUID goalRaw(UUID familyId, UUID sourceId, java.util.Map<String, Object> cols) {
		java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
		row.put("id", id());
		row.put("family_id", familyId);
		row.put("domain", "communication");
		row.put("description", "a goal");
		row.put("source_kind", "care_team_member");
		row.put("source_id", sourceId);
		row.put("origin", "prescribed");
		row.put("original_text", "original wording");
		row.put("goal_type", "narrative");
		row.put("review_status", "confirmed");
		row.putAll(cols);
		String names = String.join(", ", row.keySet());
		String marks = String.join(", ", java.util.Collections.nCopies(row.size(), "?"));
		jdbc.update("insert into goal (" + names + ") values (" + marks + ")", row.values().toArray());
		return (UUID) row.get("id");
	}

}
