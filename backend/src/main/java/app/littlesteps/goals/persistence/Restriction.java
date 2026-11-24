package app.littlesteps.goals.persistence;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.TenantId;

/**
 * A Restriction (FR-7, of one Goal or, with no Goal, of the Family). Care Team wording is {@code originalText}, written once; a
 * Caregiver edit goes in {@code caregiverText} (AD-10). Read only here.
 */
@Entity
@Table(name = "restriction")
public class Restriction {

	@Id
	private UUID id;

	@TenantId
	@Column(name = "family_id", nullable = false)
	private UUID familyId;

	@Column(name = "goal_id")
	private UUID goalId;

	/** care_team_member or caregiver. */
	@Column(name = "source_kind", nullable = false)
	private String sourceKind;

	@Column(name = "source_id", nullable = false)
	private UUID sourceId;

	/** prescribed or parent_proposed. */
	@Column(nullable = false)
	private String origin;

	@Column(name = "original_text", nullable = false, updatable = false)
	private String originalText;

	@Column(name = "caregiver_text")
	private String caregiverText;

	@Column(name = "retired_at")
	private Instant retiredAt;

	@Column(name = "created_at", nullable = false, insertable = false, updatable = false)
	private Instant createdAt;

	protected Restriction() {
	}

	public UUID getId() {
		return id;
	}

	public UUID getGoalId() {
		return goalId;
	}

	public String getSourceKind() {
		return sourceKind;
	}

	public UUID getSourceId() {
		return sourceId;
	}

	public String getOrigin() {
		return origin;
	}

	public String getOriginalText() {
		return originalText;
	}

	public String getCaregiverText() {
		return caregiverText;
	}

	public Instant getRetiredAt() {
		return retiredAt;
	}

}
