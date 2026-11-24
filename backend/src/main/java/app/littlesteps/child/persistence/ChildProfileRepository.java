package app.littlesteps.child.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/** Tenant-scoped by {@code @TenantId}: only the current Family's profile is visible. */
public interface ChildProfileRepository extends JpaRepository<ChildProfile, UUID> {

	Optional<ChildProfile> findFirstByOrderByIdAsc();

}
