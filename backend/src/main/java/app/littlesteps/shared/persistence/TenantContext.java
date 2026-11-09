package app.littlesteps.shared.persistence;

import java.util.Optional;
import java.util.UUID;

/**
 * The Family of the current request or job, read by the Hibernate tenant resolver (AD-2). Only the
 * request layer of {@code family} fills it, from the Caregiver's active membership; nothing takes a
 * Family from a request value. It is cleared when the returned {@link Scope} closes.
 */
public final class TenantContext {

	private static final ThreadLocal<UUID> CURRENT = new ThreadLocal<>();

	private TenantContext() {
	}

	public static Optional<UUID> current() {
		return Optional.ofNullable(CURRENT.get());
	}

	/** Makes {@code familyId} the tenant until the scope is closed, then restores the previous one. */
	public static Scope open(UUID familyId) {
		UUID previous = CURRENT.get();
		CURRENT.set(java.util.Objects.requireNonNull(familyId));
		return () -> {
			if (previous == null) {
				CURRENT.remove();
			}
			else {
				CURRENT.set(previous);
			}
		};
	}

	/** Closing it ends the tenant scope. */
	@FunctionalInterface
	public interface Scope extends AutoCloseable {

		@Override
		void close();

	}

}
