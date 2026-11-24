package app.littlesteps.goals.domain;

import java.util.List;

import app.littlesteps.goals.persistence.Goal;
import app.littlesteps.goals.persistence.GoalPeriod;
import app.littlesteps.goals.persistence.GoalPeriodRepository;
import app.littlesteps.goals.persistence.GoalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Read side of Goal Periods and Goals. The tenant filter limits every read to the current Family. */
@Service
public class GoalService {

	private final GoalPeriodRepository periods;

	private final GoalRepository goals;

	GoalService(GoalPeriodRepository periods, GoalRepository goals) {
		this.periods = periods;
		this.goals = goals;
	}

	@Transactional(readOnly = true)
	public List<GoalPeriod> listPeriods() {
		return periods.findAllByOrderByStartsOnAscIdAsc();
	}

	@Transactional(readOnly = true)
	public List<Goal> listGoals() {
		return goals.findAllByOrderByCreatedAtAscIdAsc();
	}

}
