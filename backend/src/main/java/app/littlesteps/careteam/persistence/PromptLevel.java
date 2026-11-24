package app.littlesteps.careteam.persistence;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.TenantId;

/** One level of the Family's ordered Prompt Level list. Retired, never deleted. */
@Entity
@Table(name = "prompt_level")
public class PromptLevel {

	@Id
	private UUID id;

	@TenantId
	@Column(name = "family_id", nullable = false)
	private UUID familyId;

	@Column(nullable = false)
	private int ordinal;

	@Column(nullable = false)
	private String label;

	@Column(name = "retired_at")
	private Instant retiredAt;

	protected PromptLevel() {
	}

	public UUID getId() {
		return id;
	}

	public UUID getFamilyId() {
		return familyId;
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
