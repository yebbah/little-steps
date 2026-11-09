package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.sql.DataSource;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.client.RestTestClient;

/** Story 25.1 matrix with the demo flag on (profile test): default, switch, unknown, no membership. */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT, properties = "littlesteps.demo.enabled=true")
@AutoConfigureRestTestClient
@org.junit.jupiter.api.extension.ExtendWith(org.springframework.boot.test.system.OutputCaptureExtension.class)
class DemoIdentityTests extends IntegrationTest {

	private static final ParameterizedTypeReference<Map<String, Object>> MAP = new ParameterizedTypeReference<>() {
	};

	static final UUID FAMILY_A = UUID.fromString("0190a000-0000-7000-8000-00000000000a");

	static final UUID FAMILY_B = UUID.fromString("0190a000-0000-7000-8000-00000000000b");

	static final UUID ANNA = UUID.fromString("0190a000-0000-7000-8000-0000000000a1");

	static final UUID BEN = UUID.fromString("0190a000-0000-7000-8000-0000000000b1");

	static final UUID CLEO = UUID.fromString("0190a000-0000-7000-8000-0000000000c1");

	@Autowired
	private RestTestClient client;

	@Autowired
	private DataSource dataSource;

	private DemoFixtures fixtures;

	@BeforeEach
	void seed() {
		fixtures = new DemoFixtures(new JdbcTemplate(dataSource));
		fixtures.reset();
		fixtures.family(FAMILY_A);
		fixtures.family(FAMILY_B);
		fixtures.caregiver(ANNA, "demo-anna", "Anna", 1);
		fixtures.caregiver(BEN, "demo-ben", "Ben", 2);
		fixtures.caregiver(CLEO, "demo-cleo", "Cleo", 3);
		fixtures.member(ANNA, FAMILY_A);
		fixtures.member(BEN, FAMILY_B);
	}

	@Test
	void noHeaderDefaultsToTheEarliestCaregiver() {
		Map<String, Object> session = session(null, 200);
		assertThat(session).containsEntry("caregiverId", ANNA.toString())
			.containsEntry("sub", "demo-anna")
			.containsEntry("displayName", "Anna")
			.containsEntry("familyId", FAMILY_A.toString())
			.containsEntry("demo", true)
			.doesNotContainKey("email");
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> all = (List<Map<String, Object>>) session.get("caregivers");
		assertThat(all).extracting(c -> c.get("displayName")).containsExactly("Anna", "Ben", "Cleo");
		assertThat(all.get(0)).containsOnlyKeys("id", "displayName");
	}

	@Test
	void theHeaderSwitchesCaregiverAndFamily() {
		Map<String, Object> session = session(BEN.toString(), 200);
		assertThat(session).containsEntry("sub", "demo-ben").containsEntry("familyId", FAMILY_B.toString());
	}

	@Test
	void anUnknownOrMalformedHeaderIs401() {
		for (String bad : new String[] { UUID.randomUUID().toString(), "not-a-uuid", "" }) {
			assertUnauthenticated(session(bad, 401));
		}
	}

	@Test
	void aCaregiverWithoutAnActiveMembershipIs401() {
		assertUnauthenticated(session(CLEO.toString(), 401));
		fixtures.endMembership(ANNA);
		assertUnauthenticated(session(ANNA.toString(), 401));
	}

	@Test
	void everyOtherApiPathIsScopedToo() {
		client.get().uri("/api/v1/test-probes").header("X-Demo-Caregiver", ANNA.toString()).exchange().expectStatus()
			.isOk();
	}

	@Test
	void anUnknownApiPathWithACaregiverIsANotFoundProblemWithNoDetail() {
		Map<String, Object> problem = client.get().uri("/api/v1/nope").header("X-Demo-Caregiver", ANNA.toString())
			.exchange().expectStatus().isNotFound().expectBody(MAP).returnResult().getResponseBody();
		assertThat(problem).containsEntry("type", "urn:littlesteps:problem:not-found").doesNotContainKey("detail");
	}

	@Test
	void aSecretInAnApiV1PathWithACaregiverIsNeverLogged(org.springframework.boot.test.system.CapturedOutput output) {
		String secret = "Mia-bit-her-brother-at-the-park";
		client.get().uri("/api/v1/nope-" + secret).header("X-Demo-Caregiver", ANNA.toString()).exchange()
			.expectStatus().isNotFound();
		assertThat(output.getAll()).doesNotContain(secret).contains("-> 404");
	}

	@Test
	void pingAndHealthNeedNoCaregiver() {
		fixtures.reset();
		client.get().uri("/api/v1/ping").exchange().expectStatus().isOk();
		client.get().uri("/actuator/health").exchange().expectStatus().isOk();
	}

	@Test
	void aSecondActiveMembershipIsRefusedByTheDatabase() {
		org.assertj.core.api.Assertions.assertThatThrownBy(() -> fixtures.member(ANNA, FAMILY_B))
			.isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
	}

	private Map<String, Object> session(String header, int status) {
		var request = client.get().uri("/api/v1/session");
		if (header != null) {
			request = request.header("X-Demo-Caregiver", header);
		}
		return request.exchange().expectStatus().isEqualTo(status).expectBody(MAP).returnResult().getResponseBody();
	}

	static void assertUnauthenticated(Map<String, Object> problem) {
		assertThat(problem).containsEntry("type", "urn:littlesteps:problem:unauthenticated")
			.containsEntry("status", 401)
			.doesNotContainKey("detail");
	}

}
