package app.littlesteps.goals.web;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import app.littlesteps.goals.domain.GoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Read-only Goal Periods and Goals of the Caregiver's Family (Story 25.3). Writes arrive in Epic 5. */
@RestController
@RequestMapping(path = "/api/v1", produces = MediaType.APPLICATION_JSON_VALUE)
class GoalController {

	/** A Goal Period of one Care Team Member. {@code status} is current or closed. */
	record GoalPeriodResponse(UUID id, UUID careTeamMemberId, LocalDate startsOn, LocalDate endsOn, String status) {
	}

	/**
	 * A Goal. {@code originalText} is the Care Team's wording, never changed; {@code caregiverText} is a
	 * Caregiver edit. The criterion fields are all null for a narrative Goal.
	 */
	record GoalResponse(UUID id, UUID goalPeriodId, String domain, String description, String sourceKind, UUID sourceId,
			String origin, String originalText, String caregiverText, String goalType, UUID parentGoalId, String context,
			String baseline, String reviewStatus, UUID proposedTo, UUID revisedFrom, String lineage, boolean retired,
			String criterionKind, Integer criterionTarget, Integer criterionOutOf, UUID criterionPromptLevelId,
			String criterionContext) {
	}

	private final GoalService service;

	GoalController(GoalService service) {
		this.service = service;
	}

	@GetMapping("/goal-periods")
	@Operation(summary = "The Family's Goal Periods")
	@ApiResponse(responseCode = "200", description = "The Goal Periods, earliest start first")
	@ApiResponse(responseCode = "401", description = "No Caregiver",
			content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
					schema = @Schema(implementation = ProblemDetail.class)))
	List<GoalPeriodResponse> periods() {
		return service.listPeriods()
			.stream()
			.map(p -> new GoalPeriodResponse(p.getId(), p.getCareTeamMemberId(), p.getStartsOn(), p.getEndsOn(),
					p.getStatus()))
			.toList();
	}

	@GetMapping("/goals")
	@Operation(summary = "The Family's Goals")
	@ApiResponse(responseCode = "200", description = "The Goals, oldest first, retired ones included")
	@ApiResponse(responseCode = "401", description = "No Caregiver",
			content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
					schema = @Schema(implementation = ProblemDetail.class)))
	List<GoalResponse> goals() {
		return service.listGoals()
			.stream()
			.map(g -> new GoalResponse(g.getId(), g.getGoalPeriodId(), g.getDomain(), g.getDescription(),
					g.getSourceKind(), g.getSourceId(), g.getOrigin(), g.getOriginalText(), g.getCaregiverText(),
					g.getGoalType(), g.getParentGoalId(), g.getContext(), g.getBaseline(), g.getReviewStatus(),
					g.getProposedTo(), g.getRevisedFrom(), g.getLineage(), g.getRetiredAt() != null,
					g.getCriterionKind(), g.getCriterionTarget(), g.getCriterionOutOf(), g.getCriterionPromptLevelId(),
					g.getCriterionContext()))
			.toList();
	}

}
