package app.littlesteps.shared.web;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.junit.jupiter.api.Test;
import app.littlesteps.IntegrationTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.client.RestTestClient;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
class PingEndpointTests extends IntegrationTest {

	private static final ParameterizedTypeReference<Map<String, Object>> MAP = new ParameterizedTypeReference<>() {
	};

	@Autowired
	private RestTestClient client;

	@Test
	void pingSucceedsWithJson() {
		Map<String, Object> body = client.get()
			.uri("/api/v1/ping")
			.exchange()
			.expectStatus()
			.isOk()
			.expectHeader()
			.contentTypeCompatibleWith(MediaType.APPLICATION_JSON)
			.expectBody(MAP)
			.returnResult()
			.getResponseBody();

		assertThat(body).containsEntry("status", "ok").containsEntry("count", 1);
	}

	@Test
	void boundaryCountsAreAccepted() {
		for (int count : new int[] { 1, 5, 10 }) {
			Map<String, Object> body = client.get().uri("/api/v1/ping?count=" + count).exchange().expectStatus().isOk()
				.expectBody(MAP).returnResult().getResponseBody();
			assertThat(body).containsEntry("count", count);
		}
	}

	@Test
	void problemsNeverCarryDetail() {
		assertThat(problem("/api/v1/ping?count=0", 400)).doesNotContainKey("detail");
		assertThat(problem("/api/v2/nope", 404)).doesNotContainKey("detail");
	}

	@Test
	void unacceptableMediaTypeIsAProblem() {
		Map<String, Object> body = client.get().uri("/api/v1/ping").accept(MediaType.APPLICATION_XML).exchange()
			.expectStatus().isEqualTo(406).expectHeader().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
			.expectBody(MAP).returnResult().getResponseBody();
		assertThat(body).containsEntry("type", "urn:littlesteps:problem:not-acceptable");
	}

	@Test
	void countOutOfRangeIsAValidationProblem() {
		for (String count : new String[] { "0", "11", "-3" }) {
			Map<String, Object> problem = problem("/api/v1/ping?count=" + count, 400);
			assertThat(problem).containsEntry("type", "urn:littlesteps:problem:validation")
				.containsEntry("status", 400)
				.containsEntry("title", "Validation failed");
		}
	}

	@Test
	void notANumberIsAValidationProblemThatDoesNotEchoTheValue() {
		String secret = "Mia-hit-her-brother";
		var result = client.get().uri("/api/v1/ping?count=" + secret).exchange();
		result.expectStatus().isBadRequest();
		String raw = new String(result.returnResult().getResponseBodyContent());

		assertThat(raw).contains("urn:littlesteps:problem:validation").doesNotContain(secret);
	}

	@Test
	void unknownApiPathIsANotFoundProblem() {
		assertThat(problem("/api/v2/nope", 404)).containsEntry("type", "urn:littlesteps:problem:not-found");
	}

	@Test
	void wrongMethodIsAMethodNotAllowedProblem() {
		Map<String, Object> problem = client.post()
			.uri("/api/v1/ping")
			.exchange()
			.expectStatus()
			.isEqualTo(405)
			.expectHeader()
			.contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
			.expectBody(MAP)
			.returnResult()
			.getResponseBody();

		assertThat(problem).containsEntry("type", "urn:littlesteps:problem:method-not-allowed");
	}

	@Test
	void problemIsSentEvenWhenTheClientAsksForHtml() {
		client.get()
			.uri("/api/v2/nope")
			.accept(MediaType.TEXT_HTML)
			.exchange()
			.expectStatus()
			.isNotFound()
			.expectHeader()
			.contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON);
	}

	@Test
	void problemCarriesTheRequestIdOfTheResponseHeader() {
		var result = client.get().uri("/api/v1/ping?count=0").exchange();
		String header = result.returnResult().getResponseHeaders().getFirst("X-Request-Id");
		Map<String, Object> problem = result.expectBody(MAP).returnResult().getResponseBody();

		assertThat(header).isNotBlank();
		assertThat(problem).containsEntry("requestId", header);
	}

	@Test
	void aSafeSuppliedRequestIdIsKept() {
		String id = client.get()
			.uri("/api/v1/ping")
			.header("X-Request-Id", "client-req-12345")
			.exchange()
			.returnResult()
			.getResponseHeaders()
			.getFirst("X-Request-Id");

		assertThat(id).isEqualTo("client-req-12345");
	}

	@Test
	void anUnsafeSuppliedRequestIdIsReplaced() {
		String id = client.get()
			.uri("/api/v1/ping")
			.header("X-Request-Id", "bad id with spaces\tand$symbols")
			.exchange()
			.returnResult()
			.getResponseHeaders()
			.getFirst("X-Request-Id");

		assertThat(id).matches("[0-9a-f-]{36}");
	}

	private Map<String, Object> problem(String uri, int status) {
		return client.get()
			.uri(uri)
			.exchange()
			.expectStatus()
			.isEqualTo(status)
			.expectHeader()
			.contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
			.expectBody(MAP)
			.returnResult()
			.getResponseBody();
	}

}
