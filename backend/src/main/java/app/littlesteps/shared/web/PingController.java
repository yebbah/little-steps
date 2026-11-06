package app.littlesteps.shared.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Sample endpoint that shows the API contract end to end: JSON under {@code /api/v1}, a validated
 * parameter, and a problem response when validation fails. Later modules copy this shape.
 */
@RestController
@RequestMapping(path = "/api/v1", produces = MediaType.APPLICATION_JSON_VALUE)
class PingController {

	/** The reply to a ping. */
	record Pong(String status, int count) {
	}

	@GetMapping("/ping")
	@ApiResponse(responseCode = "200", description = "The API answers")
	@ApiResponse(responseCode = "400", description = "Count outside 1 to 10 or not a number",
			content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
					schema = @Schema(implementation = ProblemDetail.class)))
	@Operation(summary = "Check that the API answers",
			description = "Returns status 'ok' and the requested count. A count outside 1 to 10 is a validation problem.")
	Pong ping(@RequestParam(defaultValue = "1") @Min(1) @Max(10) int count) {
		return new Pong("ok", count);
	}

}
