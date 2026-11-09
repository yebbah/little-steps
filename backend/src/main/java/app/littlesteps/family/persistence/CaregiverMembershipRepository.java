package app.littlesteps.family.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CaregiverMembershipRepository extends JpaRepository<CaregiverMembership, UUID> {

	/** The one active membership of a Caregiver, if any. */
	Optional<CaregiverMembership> findByCaregiverIdAndEndedAtIsNull(UUID caregiverId);

}
