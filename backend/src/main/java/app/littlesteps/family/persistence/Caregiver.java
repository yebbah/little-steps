package app.littlesteps.family.persistence;

import java.time.Instant;
import java.util.UUID;

import app.littlesteps.shared.domain.Uuids;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A Caregiver. Global table: a Caregiver exists before and across Families. */
@Entity
@Table(name = "caregivers")
public class Caregiver {

	@Id
	private UUID id;

	@Column(nullable = false, unique = true)
	private String sub;

	@Column(name = "display_name", nullable = false)
	private String displayName;

	@Column(nullable = false)
	private String email;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected Caregiver() {
	}

	public Caregiver(UUID id, String sub, String displayName, String email) {
		this.id = id;
		this.sub = sub;
		this.displayName = displayName;
		this.email = email;
		this.createdAt = Instant.now();
	}

	public static Caregiver create(String sub, String displayName, String email) {
		return new Caregiver(Uuids.v7(), sub, displayName, email);
	}

	public UUID getId() {
		return id;
	}

	public String getSub() {
		return sub;
	}

	public String getDisplayName() {
		return displayName;
	}

	public String getEmail() {
		return email;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

}
