package app.littlesteps.goals.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RestrictionAvoidTermRepository extends JpaRepository<RestrictionAvoidTerm, UUID> {

	List<RestrictionAvoidTerm> findAllByOrderByRestrictionIdAscOrdinalAscIdAsc();

}
