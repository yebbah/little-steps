package app.littlesteps.shared.persistence;

import java.util.UUID;

import org.hibernate.context.spi.CurrentTenantIdentifierResolver;

/**
 * Tells Hibernate which Family a session belongs to, for every entity mapped with {@code @TenantId}
 * (AD-2). With no tenant it answers a Family that does not exist, so a query returns nothing and an
 * insert is refused by the foreign key. It never answers the root tenant: {@link #isRoot} is false
 * for every value, and only a scheduled job may ever change that.
 */
public final class FamilyTenantResolver implements CurrentTenantIdentifierResolver<UUID> {

	/** Matches no Family: Family IDs are UUIDv7. */
	static final UUID NO_TENANT = new UUID(0L, 0L);

	@Override
	public UUID resolveCurrentTenantIdentifier() {
		return TenantContext.current().orElse(NO_TENANT);
	}

	@Override
	public boolean validateExistingCurrentSessions() {
		return true;
	}

	@Override
	public boolean isRoot(UUID tenantId) {
		return false;
	}

}
