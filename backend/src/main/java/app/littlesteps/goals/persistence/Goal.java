package app.littlesteps.goals.persistence;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.TenantId;

/**
 * A Goal (FR-4, FR-6). Care Team wording is {@code originalText}, written once; a Caregiver edit goes in
 * {@code caregiverText} (AD-10). References to other modules are plain IDs. Read only here.
 */
@Entity
@Table(name = "goal")
public class Goal {

	@Id
	private UUID id;

	@TenantId
	@Column(name = "family_id", nullable = false)
	private UUID familyId;

	@Column(name = "goal_period_id")
	private UUID goalPeriodId;

	@Column(nullable = false)
	private String domain;

	@Column(nullable = false)
	private String description;

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

	/** structured or narrative. */
	@Column(name = "goal_type", nullable = false)
	private String goalType;

	@Column(name = "parent_goal_id")
	private UUID parentGoalId;

	private String context;

	private String baseline;

	/** proposed, discussed or confirmed. */
	@Column(name = "review_status", nullable = false)
	private String reviewStatus;

	@Column(name = "proposed_to")
	private UUID proposedTo;

	@Column(name = "revised_from")
	private UUID revisedFrom;

	/** new, carried_over or revised. */
	@Column(nullable = false)
	private String lineage;

	@Column(name = "retired_at")
	private Instant retiredAt;

	/** trials, duration_minutes, count or frequency_per_session; null for a narrative Goal. */
	@Column(name = "criterion_kind")
	private String criterionKind;

	@Column(name = "criterion_target")
	private Integer criterionTarget;

	/** Only for trials. */
	@Column(name = "criterion_out_of")
	private Integer criterionOutOf;

	@Column(name = "criterion_prompt_level_id")
	private UUID criterionPromptLevelId;

	@Column(name = "criterion_context")
	private String criterionContext;

	@Column(name = "created_at", nullable = false, insertable = false, updatable = false)
	private Instant createdAt;

	protected Goal() {
	}

	public UUID getId() {
		return id;
	}

	public UUID getGoalPeriodId() {
		return goalPeriodId;
	}

	public String getDomain() {
		return domain;
	}

	public String getDescription() {
		return description;
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

	public String getGoalType() {
		return goalType;
	}

	public UUID getParentGoalId() {
		return parentGoalId;
	}

	public String getContext() {
		return context;
	}

	public String getBaseline() {
		return baseline;
	}

	public String getReviewStatus() {
		return reviewStatus;
	}

	public UUID getProposedTo() {
		return proposedTo;
	}

	public UUID getRevisedFrom() {
		return revisedFrom;
	}

	public String getLineage() {
		return lineage;
	}

	public Instant getRetiredAt() {
		return retiredAt;
	}

	public String getCriterionKind() {
		return criterionKind;
	}

	public Integer getCriterionTarget() {
		return criterionTarget;
	}

	public Integer getCriterionOutOf() {
		return criterionOutOf;
	}

	public UUID getCriterionPromptLevelId() {
		return criterionPromptLevelId;
	}

	public String getCriterionContext() {
		return criterionContext;
	}

}
