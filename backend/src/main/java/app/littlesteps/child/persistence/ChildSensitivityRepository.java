package app.littlesteps.child.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ChildSensitivityRepository extends JpaRepository<ChildSensitivity, UUID> {

	List<ChildSensitivity> findByChildProfileIdOrderByOrdinalAscIdAsc(UUID childProfileId);

	List<ChildSensitivity> findByAvoidTrueOrderByOrdinalAscIdAsc();

}
