package app.littlesteps.careteam.web;

import java.util.List;
import java.util.UUID;

import app.littlesteps.careteam.domain.CareTeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Read-only Care Team and Prompt Levels of the Caregiver's Family (Story 25.3). Writes arrive in Epic 5. */
@RestController
@RequestMapping(path = "/api/v1", produces = MediaType.APPLICATION_JSON_VALUE)
class CareTeamController {

	/** A word of the member's Status Vocabulary, in order. */
	record StatusVocabularyItemResponse(UUID id, int ordinal, String label, boolean retired) {
	}

	/** The member's own label for one of the Family's Prompt Levels. */
	record PromptLevelMappingResponse(UUID promptLevelId, String label) {
	}

	/** A Care Team Member. {@code careSetting} is one of clinic, school, home_visit, online. */
	record CareTeamMemberResponse(UUID id, String role, String discipline, String careSetting,
			List<StatusVocabularyItemResponse> statusVocabulary, List<PromptLevelMappingResponse> promptLevelMapping) {
	}

	/** A Prompt Level of the Family's ordered list. Retired levels are still listed. */
	record PromptLevelResponse(UUID id, int ordinal, String label, boolean retired) {
	}

	private final CareTeamService service;

	CareTeamController(CareTeamService service) {
		this.service = service;
	}

	@GetMapping("/care-team-members")
	@Operation(summary = "The Family's Care Team Members, each with a Status Vocabulary and Prompt Level mapping")
	@ApiResponse(responseCode = "200", description = "The Care Team Members, oldest first")
	@ApiResponse(responseCode = "401", description = "No Caregiver",
			content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
					schema = @Schema(implementation = ProblemDetail.class)))
	List<CareTeamMemberResponse> members() {
		return service.listMembers()
			.stream()
			.map(m -> new CareTeamMemberResponse(m.member().getId(), m.member().getRole(), m.member().getDiscipline(),
					m.member().getCareSetting(),
					m.statusVocabulary()
						.stream()
						.map(w -> new StatusVocabularyItemResponse(w.getId(), w.getOrdinal(), w.getLabel(),
								w.getRetiredAt() != null))
						.toList(),
					m.promptLevelMapping()
						.stream()
						.map(l -> new PromptLevelMappingResponse(l.getPromptLevelId(), l.getLabel()))
						.toList()))
			.toList();
	}

	@GetMapping("/prompt-levels")
	@Operation(summary = "The Family's ordered Prompt Levels")
	@ApiResponse(responseCode = "200", description = "The Prompt Levels in order, retired ones included")
	@ApiResponse(responseCode = "401", description = "No Caregiver",
			content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
					schema = @Schema(implementation = ProblemDetail.class)))
	List<PromptLevelResponse> promptLevels() {
		return service.listPromptLevels()
			.stream()
			.map(p -> new PromptLevelResponse(p.getId(), p.getOrdinal(), p.getLabel(), p.getRetiredAt() != null))
			.toList();
	}

}
