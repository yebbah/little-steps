package app.littlesteps.family.persistence;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.ZoneId;
import java.util.UUID;

import app.littlesteps.shared.domain.Uuids;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A Family: the tenant. Global table, read before a tenant exists. */
@Entity
@Table(name = "families")
public class Family {

	@Id
	private UUID id;

	@Column(nullable = false)
	private String timezone;

	@Enumerated(EnumType.STRING)
	@Column(name = "week_start", nullable = false)
	private DayOfWeek weekStart;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected Family() {
	}

	public Family(UUID id, String timezone, DayOfWeek weekStart) {
		if (!ZoneId.getAvailableZoneIds().contains(timezone)) {
			throw new IllegalArgumentException("Not an IANA time zone ID");
		}
		this.id = id;
		this.timezone = timezone;
		this.weekStart = weekStart;
		this.createdAt = Instant.now();
	}

	public static Family create(String timezone) {
		return new Family(Uuids.v7(), timezone, DayOfWeek.MONDAY);
	}

	public UUID getId() {
		return id;
	}

	public String getTimezone() {
		return timezone;
	}

	public DayOfWeek getWeekStart() {
		return weekStart;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

}
