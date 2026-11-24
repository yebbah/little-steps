package app.littlesteps.careteam.persistence;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.TenantId;

/** One word of a Care Team Member's Status Vocabulary. Retired, never deleted. */
@Entity
@Table(name = "status_vocabulary_item")
public class StatusVocabularyItem {

	@Id
	private UUID id;

	@TenantId
	@Column(name = "family_id", nullable = false)
	private UUID familyId;

	@Column(name = "care_team_member_id", nullable = false)
	private UUID careTeamMemberId;

	@Column(nullable = false)
	private int ordinal;

	@Column(nullable = false)
	private String label;

	@Column(name = "retired_at")
	private Instant retiredAt;

	protected StatusVocabularyItem() {
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

	public int getOrdinal() {
		return ordinal;
	}

	public String getLabel() {
		return label;
	}

	public Instant getRetiredAt() {
		return retiredAt;
	}

}
