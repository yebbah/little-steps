package app.littlesteps.goals.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalPeriodRepository extends JpaRepository<GoalPeriod, UUID> {

	List<GoalPeriod> findAllByOrderByStartsOnAscIdAsc();

}
