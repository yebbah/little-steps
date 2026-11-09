package app.littlesteps.family.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CaregiverRepository extends JpaRepository<Caregiver, UUID> {

	/** The earliest-created Caregiver, then the smallest ID. */
	Optional<Caregiver> findFirstByOrderByCreatedAtAscIdAsc();

	List<Caregiver> findAllByOrderByCreatedAtAscIdAsc();

}
