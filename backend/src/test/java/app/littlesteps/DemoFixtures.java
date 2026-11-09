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
		jdbc.update("delete from tenant_probe");
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

}
