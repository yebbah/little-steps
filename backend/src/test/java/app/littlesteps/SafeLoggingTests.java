package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.client.RestTestClient;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

/** AD-19: logs are JSON, carry a request ID, and never hold request bodies or Caregiver text. */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT, properties = "test.safe-logging=true")
@AutoConfigureRestTestClient
@ExtendWith(OutputCaptureExtension.class)
class SafeLoggingTests extends IntegrationTest {

	private static final String SECRET = "Mia-bit-her-brother-at-the-park";

	@Autowired
	private RestTestClient client;

	@Test
	void caregiverTextNeverReachesTheLogsEvenWhenLoggedOnPurposeBySloppyCode(CapturedOutput output) {
		client.post()
			.uri("/api/v1/test/note")
			.contentType(MediaType.TEXT_PLAIN)
			.header("X-Request-Id", "req-for-log-test")
			.body(SECRET)
			.exchange()
			.expectStatus()
			.isOk();

		assertThat(output.getAll()).doesNotContain(SECRET)
			.contains("received note [redacted]")
			.contains("\"requestId\":\"req-for-log-test\"");
	}

	@Test
	void requestBodyIsNotEchoedInTheResponseWhenTheRequestFails(CapturedOutput output) {
		String responseBody = client.post()
			.uri("/api/v1/test/boom")
			.contentType(MediaType.TEXT_PLAIN)
			.body(SECRET)
			.exchange()
			.expectStatus()
			.is5xxServerError()
			.expectHeader()
			.contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
			.expectBody(String.class)
			.returnResult()
			.getResponseBody();

		assertThat(responseBody).doesNotContain(SECRET);
		// The stack trace is logged on purpose until error references exist (#91).
		assertThat(output.getAll()).contains("Unhandled exception of type java.lang.IllegalStateException");
	}

	@Test
	void queryStringIsNotLoggedInTheAccessLine(CapturedOutput output) {
		client.get().uri("/api/v1/ping?count=" + SECRET).exchange().expectStatus().isBadRequest();

		assertThat(output.getAll()).doesNotContain(SECRET).contains("GET /api/v1/ping -> 400");
	}

	@Test
	void everyLogLineIsParsableJsonAndTheAccessLineCarriesTheResponseRequestId(CapturedOutput output) {
		String id = client.get().uri("/api/v1/ping").exchange().expectStatus().isOk().returnResult()
			.getResponseHeaders().getFirst("X-Request-Id");
		ObjectMapper mapper = JsonMapper.builder().build();

		var lines = output.getAll().lines().filter(line -> !line.isBlank()).map(mapper::readTree).toList();

		assertThat(lines).isNotEmpty().allSatisfy(node -> {
			assertThat(node.has("@timestamp")).isTrue();
			assertThat(node.has("message")).isTrue();
		});
		assertThat(lines).anySatisfy(node -> {
			assertThat(node.path("log").path("logger").asString()).isEqualTo("app.littlesteps.http");
			assertThat(node.path("requestId").asString()).isEqualTo(id);
		});
	}

	@Test
	void failureLogLineHasTheRequestIdAndTheStackTrace(CapturedOutput output) {
		client.post().uri("/api/v1/test/boom").contentType(MediaType.TEXT_PLAIN).header("X-Request-Id", "boom-req-0001")
			.body(SECRET).exchange().expectStatus().is5xxServerError();

		String line = output.getAll().lines().filter(l -> l.contains("Unhandled exception")).findFirst().orElseThrow();
		assertThat(line).contains("\"requestId\":\"boom-req-0001\"")
			.contains("\"stack_trace\":\"java.lang.IllegalStateException");
	}

	@Test
	void malformedJsonBodyIsNotLogged(CapturedOutput output) {
		client.post().uri("/api/v1/test/json").contentType(MediaType.APPLICATION_JSON).body("{\"note\":\"" + SECRET + "\"")
			.exchange().expectStatus().isBadRequest();

		assertThat(output.getAll()).doesNotContain(SECRET);
	}

	@Test
	void unsafeRequestIdIsNeverLogged(CapturedOutput output) {
		client.get().uri("/api/v1/ping").header("X-Request-Id", "evil\"injected-field").exchange();

		assertThat(output.getAll()).doesNotContain("injected-field");
	}

	@Test
	void pathValuesAreNotLoggedOnlyTheRoutePattern(CapturedOutput output) {
		client.get().uri("/api/v1/nope-" + SECRET).exchange().expectStatus().isNotFound();

		assertThat(output.getAll()).doesNotContain(SECRET).contains("-> 404");
	}

}
