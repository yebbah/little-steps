package app.littlesteps.family.persistence;

import java.time.Instant;
import java.util.UUID;

import app.littlesteps.shared.domain.Uuids;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * A Caregiver's membership of a Family. Global table: it is read to find the Family before a tenant
 * exists. At most one membership per Caregiver is active (ended_at is null).
 */
@Entity
@Table(name = "caregiver_membership")
public class CaregiverMembership {

	@Id
	private UUID id;

	@Column(name = "caregiver_id", nullable = false)
	private UUID caregiverId;

	@Column(name = "family_id", nullable = false)
	private UUID familyId;

	@Column(nullable = false)
	private String role = "caregiver";

	@Column(name = "joined_at", nullable = false)
	private Instant joinedAt;

	@Column(name = "ended_at")
	private Instant endedAt;

	@Column(name = "end_reason")
	private String endReason;

	protected CaregiverMembership() {
	}

	public CaregiverMembership(UUID caregiverId, UUID familyId) {
		this.id = Uuids.v7();
		this.caregiverId = caregiverId;
		this.familyId = familyId;
		this.joinedAt = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public UUID getCaregiverId() {
		return caregiverId;
	}

	public UUID getFamilyId() {
		return familyId;
	}

	public String getRole() {
		return role;
	}

	public Instant getJoinedAt() {
		return joinedAt;
	}

	public Instant getEndedAt() {
		return endedAt;
	}

	public String getEndReason() {
		return endReason;
	}

}
