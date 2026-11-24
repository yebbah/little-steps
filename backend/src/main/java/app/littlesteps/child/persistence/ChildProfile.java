package app.littlesteps.child.persistence;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.TenantId;

/** The Family's Child Profile: a nickname, never a real name or date of birth (FR-2). Read only here. */
@Entity
@Table(name = "child_profile")
public class ChildProfile {

	@Id
	private UUID id;

	@TenantId
	@Column(name = "family_id", nullable = false)
	private UUID familyId;

	@Column(nullable = false)
	private String nickname;

	@Column(name = "age_band")
	private String ageBand;

	private String interests;

	private String materials;

	@Column(name = "engagement_notes")
	private String engagementNotes;

	protected ChildProfile() {
	}

	public UUID getId() {
		return id;
	}

	public UUID getFamilyId() {
		return familyId;
	}

	public String getNickname() {
		return nickname;
	}

	public String getAgeBand() {
		return ageBand;
	}

	public String getInterests() {
		return interests;
	}

	public String getMaterials() {
		return materials;
	}

	public String getEngagementNotes() {
		return engagementNotes;
	}

}
