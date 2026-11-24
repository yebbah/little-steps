package app.littlesteps.child.web;

import java.util.List;
import java.util.UUID;

import app.littlesteps.child.domain.ChildProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Read-only Child Profile of the Caregiver's Family (Story 25.3). Writes arrive in Epic 4. */
@RestController
@RequestMapping(path = "/api/v1", produces = MediaType.APPLICATION_JSON_VALUE)
class ChildProfileController {

	/** One sensitivity: its text and whether the Child is to avoid it. */
	record SensitivityResponse(UUID id, String text, boolean avoid) {
	}

	/** The Child Profile. No real name and no date of birth: a nickname and an optional age band. */
	record ChildProfileResponse(UUID id, String nickname, String ageBand, String interests, String materials,
			String engagementNotes, List<SensitivityResponse> sensitivities) {
	}

	private final ChildProfileService service;

	ChildProfileController(ChildProfileService service) {
		this.service = service;
	}

	@GetMapping("/child-profile")
	@Operation(summary = "The Family's Child Profile")
	@ApiResponse(responseCode = "200", description = "The Child Profile")
	@ApiResponse(responseCode = "401", description = "No Caregiver",
			content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
					schema = @Schema(implementation = ProblemDetail.class)))
	@ApiResponse(responseCode = "404", description = "The Family has no Child Profile (problem type not-found)",
			content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
					schema = @Schema(implementation = ProblemDetail.class)))
	ChildProfileResponse get() {
		ChildProfileService.Profile found = service.find()
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
		var p = found.profile();
		return new ChildProfileResponse(p.getId(), p.getNickname(), p.getAgeBand(), p.getInterests(), p.getMaterials(),
				p.getEngagementNotes(),
				found.sensitivities().stream().map(s -> new SensitivityResponse(s.getId(), s.getText(), s.isAvoid())).toList());
	}

}
