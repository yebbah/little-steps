package app.littlesteps.goals.web;

import java.util.List;
import java.util.UUID;

import app.littlesteps.goals.domain.StrategyRestrictionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Read-only Strategies and Restrictions of the Caregiver's Family (Story 25.4). Writes arrive in Epic 6. */
@RestController
@RequestMapping(path = "/api/v1", produces = MediaType.APPLICATION_JSON_VALUE)
class StrategyRestrictionController {

	/** A Strategy of one Goal. {@code originalText} is the Care Team's wording, never changed. */
	record StrategyResponse(UUID id, UUID goalId, String sourceKind, UUID sourceId, String origin, String originalText,
			String caregiverText, boolean retired) {
	}

	/**
	 * A Restriction of one Goal, or of the Family when {@code goalId} is null. A retired one no longer
	 * applies. {@code avoidTerms} are phrases it names, in order.
	 */
	record RestrictionResponse(UUID id, UUID goalId, String sourceKind, UUID sourceId, String origin,
			String originalText, String caregiverText, boolean retired, List<String> avoidTerms) {
	}

	private final StrategyRestrictionService service;

	StrategyRestrictionController(StrategyRestrictionService service) {
		this.service = service;
	}

	@GetMapping("/strategies")
	@Operation(summary = "The Family's Strategies")
	@ApiResponse(responseCode = "200", description = "The Strategies, oldest first, retired ones included")
	@ApiResponse(responseCode = "401", description = "No Caregiver",
			content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
					schema = @Schema(implementation = ProblemDetail.class)))
	List<StrategyResponse> strategies() {
		return service.listStrategies()
			.stream()
			.map(s -> new StrategyResponse(s.getId(), s.getGoalId(), s.getSourceKind(), s.getSourceId(), s.getOrigin(),
					s.getOriginalText(), s.getCaregiverText(), s.getRetiredAt() != null))
			.toList();
	}

	@GetMapping("/restrictions")
	@Operation(summary = "The Family's Restrictions")
	@ApiResponse(responseCode = "200", description = "The Restrictions, oldest first, retired ones included")
	@ApiResponse(responseCode = "401", description = "No Caregiver",
			content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
					schema = @Schema(implementation = ProblemDetail.class)))
	List<RestrictionResponse> restrictions() {
		return service.listRestrictions()
			.stream()
			.map(v -> new RestrictionResponse(v.restriction().getId(), v.restriction().getGoalId(),
					v.restriction().getSourceKind(), v.restriction().getSourceId(), v.restriction().getOrigin(),
					v.restriction().getOriginalText(), v.restriction().getCaregiverText(),
					v.restriction().getRetiredAt() != null, v.avoidTerms().stream().map(t -> t.getTerm()).toList()))
			.toList();
	}

}
