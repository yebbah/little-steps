package app.littlesteps.tenantprobe;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.TenantId;

/** Test-only Family-owned entity: proves {@code @TenantId} isolation until real Family tables exist. */
@Entity
@Table(name = "tenant_probe")
public class TenantProbe {

	@Id
	private UUID id;

	@TenantId
	@Column(name = "family_id", nullable = false)
	private UUID familyId;

	@Column(nullable = false)
	private String label;

	protected TenantProbe() {
	}

	public TenantProbe(UUID id, String label) {
		this.id = id;
		this.label = label;
	}

	/** Deliberately names a Family, to prove a cross-write is not stored under it. */
	public TenantProbe(UUID id, UUID familyId, String label) {
		this(id, label);
		this.familyId = familyId;
	}

	public UUID getId() {
		return id;
	}

	public UUID getFamilyId() {
		return familyId;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

}
