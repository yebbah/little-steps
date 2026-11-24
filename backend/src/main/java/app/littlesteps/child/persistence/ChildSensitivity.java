package app.littlesteps.child.persistence;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.TenantId;

/** One sensitivity of the Child: its text and whether it is to be avoided. */
@Entity
@Table(name = "child_sensitivity")
public class ChildSensitivity {

	@Id
	private UUID id;

	@TenantId
	@Column(name = "family_id", nullable = false)
	private UUID familyId;

	@Column(name = "child_profile_id", nullable = false)
	private UUID childProfileId;

	@Column(nullable = false)
	private int ordinal;

	@Column(nullable = false)
	private String text;

	@Column(nullable = false)
	private boolean avoid;

	protected ChildSensitivity() {
	}

	public UUID getId() {
		return id;
	}

	public UUID getChildProfileId() {
		return childProfileId;
	}

	public int getOrdinal() {
		return ordinal;
	}

	public String getText() {
		return text;
	}

	public boolean isAvoid() {
		return avoid;
	}

}
