package app.littlesteps;

import java.util.List;

import javax.sql.DataSource;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.client.RestTestClient;

/** Story 25.3, "No Caregiver": with the demo flag off the five read endpoints are 401, header or not. */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
class ReadApiFlagOffTests extends IntegrationTest {

	private static final List<String> PATHS = List.of("/api/v1/child-profile", "/api/v1/care-team-members",
			"/api/v1/prompt-levels", "/api/v1/goal-periods", "/api/v1/goals");

	@Autowired
	private RestTestClient client;

	@Autowired
	private DataSource dataSource;

	@BeforeEach
	void seed() {
		DemoFixtures fixtures = new DemoFixtures(new JdbcTemplate(dataSource));
		fixtures.reset();
		fixtures.family(DemoIdentityTests.FAMILY_A);
		fixtures.caregiver(DemoIdentityTests.ANNA, "demo-anna", "Anna", 1);
		fixtures.member(DemoIdentityTests.ANNA, DemoIdentityTests.FAMILY_A);
		fixtures.childProfile(DemoIdentityTests.FAMILY_A, "Sparrow");
	}

	@Test
	void everyPathIs401WithNoHeader() {
		for (String path : PATHS) {
			client.get().uri(path).exchange().expectStatus().isUnauthorized();
		}
	}

	@Test
	void everyPathIs401WithAValidLookingHeader() {
		for (String path : PATHS) {
			client.get()
				.uri(path)
				.header("X-Demo-Caregiver", DemoIdentityTests.ANNA.toString())
				.exchange()
				.expectStatus()
				.isUnauthorized();
		}
	}

}
