package app.littlesteps.family.web;

import java.util.List;
import java.util.UUID;

import app.littlesteps.family.api.CaregiverContext;
import app.littlesteps.family.api.CurrentCaregiver;
import app.littlesteps.shared.web.UnauthenticatedException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The demo session (Story 25.1). It answers only while the demo flag is on: without the demo
 * resolver bean it is a 401. Display name and the Caregiver list appear nowhere else.
 */
@RestController
@RequestMapping(path = "/api/v1", produces = MediaType.APPLICATION_JSON_VALUE)
class SessionController {

	/** A Caregiver the demo can switch to. */
	record CaregiverSummary(UUID id, String displayName) {
	}

	/** The Caregiver the request runs as, the Family of their membership, and all demo Caregivers. */
	record SessionResponse(UUID caregiverId, String sub, String displayName, UUID familyId, boolean demo,
			List<CaregiverSummary> caregivers) {
	}

	private final CaregiverContext context;

	private final ObjectProvider<DemoCaregiverResolver> demo;

	SessionController(CaregiverContext context, ObjectProvider<DemoCaregiverResolver> demo) {
		this.context = context;
		this.demo = demo;
	}

	@GetMapping("/session")
	@Operation(summary = "The demo session",
			description = "Demo only: the Caregiver and Family the request runs as, and every demo Caregiver. 401 unless the demo flag is on.")
	@ApiResponse(responseCode = "200", description = "The demo session")
	@ApiResponse(responseCode = "401", description = "No Caregiver, or the demo flag is off",
			content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
					schema = @Schema(implementation = ProblemDetail.class)))
	SessionResponse session() {
		DemoCaregiverResolver resolver = demo.getIfAvailable();
		CurrentCaregiver current = context.current().orElseThrow(UnauthenticatedException::new);
		if (resolver == null) {
			throw new UnauthenticatedException();
		}
		String displayName = resolver.caregiver(current.caregiverId())
			.orElseThrow(UnauthenticatedException::new)
			.getDisplayName();
		List<CaregiverSummary> all = resolver.allCaregivers()
			.stream()
			.map(c -> new CaregiverSummary(c.getId(), c.getDisplayName()))
			.toList();
		return new SessionResponse(current.caregiverId(), current.sub(), displayName, current.familyId(), true, all);
	}

}
