package app.littlesteps.careteam.persistence;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.TenantId;

/** A member of the Care Team. Read only here. */
@Entity
@Table(name = "care_team_member")
public class CareTeamMember {

	@Id
	private UUID id;

	@TenantId
	@Column(name = "family_id", nullable = false)
	private UUID familyId;

	@Column(nullable = false)
	private String role;

	private String discipline;

	@Column(name = "care_setting", nullable = false)
	private String careSetting;

	@Column(name = "created_at", nullable = false, insertable = false, updatable = false)
	private Instant createdAt;

	protected CareTeamMember() {
	}

	public UUID getId() {
		return id;
	}

	public UUID getFamilyId() {
		return familyId;
	}

	public String getRole() {
		return role;
	}

	public String getDiscipline() {
		return discipline;
	}

	/** One of clinic, school, home_visit, online. */
	public String getCareSetting() {
		return careSetting;
	}

}
