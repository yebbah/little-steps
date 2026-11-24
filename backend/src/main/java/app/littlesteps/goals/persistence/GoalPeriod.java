package app.littlesteps.goals.persistence;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.TenantId;

/** A Goal Period of one Care Team Member. The member is a plain ID: no association across modules (AD-1). */
@Entity
@Table(name = "goal_period")
public class GoalPeriod {

	@Id
	private UUID id;

	@TenantId
	@Column(name = "family_id", nullable = false)
	private UUID familyId;

	@Column(name = "care_team_member_id", nullable = false)
	private UUID careTeamMemberId;

	@Column(name = "starts_on", nullable = false)
	private LocalDate startsOn;

	@Column(name = "ends_on")
	private LocalDate endsOn;

	/** current or closed. */
	@Column(nullable = false)
	private String status;

	@Column(name = "created_at", nullable = false, insertable = false, updatable = false)
	private Instant createdAt;

	protected GoalPeriod() {
	}

	public UUID getId() {
		return id;
	}

	public UUID getCareTeamMemberId() {
		return careTeamMemberId;
	}

	public LocalDate getStartsOn() {
		return startsOn;
	}

	public LocalDate getEndsOn() {
		return endsOn;
	}

	public String getStatus() {
		return status;
	}

}
