package app.littlesteps.goals.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RestrictionRepository extends JpaRepository<Restriction, UUID> {

	List<Restriction> findAllByOrderByCreatedAtAscIdAsc();

}
