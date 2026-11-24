package app.littlesteps.careteam.persistence;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.TenantId;

/** The member's own label for one of the Family's Prompt Levels. */
@Entity
@Table(name = "care_team_member_prompt_level")
public class MemberPromptLevel {

	@Id
	private UUID id;

	@TenantId
	@Column(name = "family_id", nullable = false)
	private UUID familyId;

	@Column(name = "care_team_member_id", nullable = false)
	private UUID careTeamMemberId;

	@Column(name = "prompt_level_id", nullable = false)
	private UUID promptLevelId;

	@Column(nullable = false)
	private String label;

	protected MemberPromptLevel() {
	}

	public UUID getId() {
		return id;
	}

	public UUID getFamilyId() {
		return familyId;
	}

	public UUID getCareTeamMemberId() {
		return careTeamMemberId;
	}

	public UUID getPromptLevelId() {
		return promptLevelId;
	}

	public String getLabel() {
		return label;
	}

}
