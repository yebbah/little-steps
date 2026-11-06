package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.client.RestTestClient;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
class HealthEndpointTests extends IntegrationTest {

	@Autowired
	private RestTestClient client;

	@Test
	void healthIsUpWithoutDetails() {
		Map<String, Object> body = client.get()
			.uri("/actuator/health")
			.exchange()
			.expectStatus()
			.isEqualTo(HttpStatus.OK)
			.expectBody(new ParameterizedTypeReference<Map<String, Object>>() {
			})
			.returnResult()
			.getResponseBody();

		assertThat(body).isNotNull().containsEntry("status", "UP");
		assertThat(body).doesNotContainKeys("components", "details");
	}

	@Test
	void otherActuatorEndpointsAreNotExposed() {
		client.get().uri("/actuator/env").exchange().expectStatus().isNotFound();
		client.get().uri("/actuator/beans").exchange().expectStatus().isNotFound();
	}

}
