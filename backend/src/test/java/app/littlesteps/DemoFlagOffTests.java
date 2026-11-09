package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import java.util.UUID;

import javax.sql.DataSource;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.context.ApplicationContext;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.client.RestTestClient;

/** Flag off (the default): no demo resolver, every /api/v1 path but ping is 401, and the header is ignored. */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
class DemoFlagOffTests extends IntegrationTest {

	private static final ParameterizedTypeReference<Map<String, Object>> MAP = new ParameterizedTypeReference<>() {
	};

	@Autowired
	private RestTestClient client;

	@Autowired
	private DataSource dataSource;

	@Autowired
	private ApplicationContext context;

	@BeforeEach
	void seed() {
		DemoFixtures fixtures = new DemoFixtures(new JdbcTemplate(dataSource));
		fixtures.reset();
		fixtures.family(DemoIdentityTests.FAMILY_A);
		fixtures.caregiver(DemoIdentityTests.ANNA, "demo-anna", "Anna", 1);
		fixtures.member(DemoIdentityTests.ANNA, DemoIdentityTests.FAMILY_A);
	}

	@Test
	void theDemoResolverIsNotABean() {
		assertThat(context.containsBean("demoCaregiverResolver")).isFalse();
	}

	@Test
	void everyApiPathExceptPingIs401EvenWithTheHeader() {
		for (String path : new String[] { "/api/v1/session", "/api/v1/test-probes", "/api/v1/nope",
				"/api/v1/test-probes/" + UUID.randomUUID() }) {
			for (boolean header : new boolean[] { false, true }) {
				var request = client.get().uri(path);
				if (header) {
					request = request.header("X-Demo-Caregiver", DemoIdentityTests.ANNA.toString());
				}
				Map<String, Object> problem = request.exchange()
					.expectStatus()
					.isUnauthorized()
					.expectHeader()
					.contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
					.expectBody(MAP)
					.returnResult()
					.getResponseBody();
				DemoIdentityTests.assertUnauthenticated(problem);
			}
		}
		client.put().uri("/api/v1/test-probes/" + UUID.randomUUID()).contentType(MediaType.APPLICATION_JSON)
			.body("{\"label\":\"x\"}").exchange().expectStatus().isUnauthorized();
	}

	@org.springframework.boot.test.web.server.LocalServerPort
	int port;

	@Test
	void encodedParameterDotSegmentAndSlashVariantsAreStill401() throws Exception {
		// A raw HTTP client, so the path reaches the server exactly as written.
		var http = java.net.http.HttpClient.newHttpClient();
		for (String path : new String[] { "/api/%76%31/session", "/api/v1;x/session", "/x/../api/v1/session",
				"//api/v1/session", "/api/v1//session", "/api/v1", "/api/v1/ping/x", "/api/v1/ping-x",
				"/api/v1/ping;x=y/z", "/api/v1/%70ing/x" }) {
			var request = java.net.http.HttpRequest.newBuilder(java.net.URI.create("http://localhost:" + port + path))
				.build();
			int status = http.send(request, java.net.http.HttpResponse.BodyHandlers.discarding()).statusCode();
			assertThat(status).as(path).isEqualTo(401);
		}
		client.get().uri("/api/v1/ping").exchange().expectStatus().isOk();
	}

	@Test
	void pingAndHealthAreUnaffected() {
		client.get().uri("/api/v1/ping").exchange().expectStatus().isOk();
		client.get().uri("/actuator/health").exchange().expectStatus().isOk();
	}

}
