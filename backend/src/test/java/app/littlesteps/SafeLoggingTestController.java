package app.littlesteps;

import app.littlesteps.shared.text.CaregiverText;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** Test-only endpoints for {@link SafeLoggingTests}; active only when test.safe-logging is set. */
@RestController
@ConditionalOnProperty("test.safe-logging")
class SafeLoggingTestController {

	private static final Logger log = LoggerFactory.getLogger(SafeLoggingTestController.class);

	@PostMapping("/test-support/note")
	String note(@RequestBody String body) {
		// Deliberately sloppy: the value type must still keep the text out of the log.
		log.info("received note {}", new CaregiverText(body));
		return "ok";
	}

	record Note(String note) {
	}

	@PostMapping(path = "/test-support/json", consumes = "application/json")
	String json(@RequestBody Note body) {
		return "ok";
	}

	@PostMapping("/test-support/boom")
	String boom(@RequestBody String body) {
		throw new IllegalStateException("failed for " + body);
	}

}
