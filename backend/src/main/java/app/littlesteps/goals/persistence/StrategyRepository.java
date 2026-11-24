package app.littlesteps.goals.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StrategyRepository extends JpaRepository<Strategy, UUID> {

	List<Strategy> findAllByOrderByCreatedAtAscIdAsc();

}
