package app.littlesteps.devecho;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.TenantId;

/** Test-only Family-owned row: the body of one echoed {@code PUT}. */
@Entity
@Table(name = "dev_echo")
public class DevEcho {

	@Id
	private UUID id;

	@TenantId
	@Column(name = "family_id", nullable = false)
	private UUID familyId;

	@Column(nullable = false)
	private String body;

	protected DevEcho() {
	}

	public DevEcho(UUID id, String body) {
		this.id = id;
		this.body = body;
	}

	public UUID getId() {
		return id;
	}

	public String getBody() {
		return body;
	}

}
