package app.littlesteps.goals.persistence;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.TenantId;

/** One phrase a Restriction names to avoid. Read only here. */
@Entity
@Table(name = "restriction_avoid_term")
public class RestrictionAvoidTerm {

	@Id
	private UUID id;

	@TenantId
	@Column(name = "family_id", nullable = false)
	private UUID familyId;

	@Column(name = "restriction_id", nullable = false)
	private UUID restrictionId;

	@Column(nullable = false)
	private int ordinal;

	@Column(nullable = false)
	private String term;

	protected RestrictionAvoidTerm() {
	}

	public UUID getId() {
		return id;
	}

	public UUID getRestrictionId() {
		return restrictionId;
	}

	public int getOrdinal() {
		return ordinal;
	}

	public String getTerm() {
		return term;
	}

}
