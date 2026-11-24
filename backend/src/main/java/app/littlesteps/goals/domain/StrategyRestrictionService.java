package app.littlesteps.goals.domain;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import app.littlesteps.goals.persistence.Restriction;
import app.littlesteps.goals.persistence.RestrictionAvoidTerm;
import app.littlesteps.goals.persistence.RestrictionAvoidTermRepository;
import app.littlesteps.goals.persistence.RestrictionRepository;
import app.littlesteps.goals.persistence.Strategy;
import app.littlesteps.goals.persistence.StrategyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Read side of Strategies and Restrictions. The tenant filter limits every read to the current Family. */
@Service
public class StrategyRestrictionService {

	/** A Restriction with its avoid terms, in order. */
	public record RestrictionView(Restriction restriction, List<RestrictionAvoidTerm> avoidTerms) {
	}

	private final StrategyRepository strategies;

	private final RestrictionRepository restrictions;

	private final RestrictionAvoidTermRepository avoidTerms;

	StrategyRestrictionService(StrategyRepository strategies, RestrictionRepository restrictions,
			RestrictionAvoidTermRepository avoidTerms) {
		this.strategies = strategies;
		this.restrictions = restrictions;
		this.avoidTerms = avoidTerms;
	}

	@Transactional(readOnly = true)
	public List<Strategy> listStrategies() {
		return strategies.findAllByOrderByCreatedAtAscIdAsc();
	}

	/** Every Restriction of the Family, retired ones included. */
	@Transactional(readOnly = true)
	public List<RestrictionView> listRestrictions() {
		Map<UUID, List<RestrictionAvoidTerm>> terms = avoidTerms.findAllByOrderByRestrictionIdAscOrdinalAscIdAsc()
			.stream()
			.collect(Collectors.groupingBy(RestrictionAvoidTerm::getRestrictionId));
		return restrictions.findAllByOrderByCreatedAtAscIdAsc()
			.stream()
			.map(r -> new RestrictionView(r, terms.getOrDefault(r.getId(), List.of())))
			.toList();
	}

}
