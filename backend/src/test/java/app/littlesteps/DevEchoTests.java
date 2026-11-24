package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import javax.sql.DataSource;

import app.littlesteps.devecho.DevEchoController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.client.RestTestClient;

/** Story 25.2: the test-profile echo endpoint, its replay rule and its absence outside the test profile. */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT, properties = { "littlesteps.demo.enabled=true", "springdoc.api-docs.enabled=true" })
@AutoConfigureRestTestClient
class DevEchoTests extends IntegrationTest {

	private static final UUID ID = UUID.fromString("0190a000-0000-7000-8000-00000000ec01");

	@Autowired
	private RestTestClient client;

	@Autowired
	private DataSource dataSource;

	private JdbcTemplate jdbc;

	@BeforeEach
	void seed() {
		jdbc = new JdbcTemplate(dataSource);
		DemoFixtures fixtures = new DemoFixtures(jdbc);
		fixtures.reset();
		fixtures.family(DemoIdentityTests.FAMILY_A);
		fixtures.family(DemoIdentityTests.FAMILY_B);
		fixtures.caregiver(DemoIdentityTests.ANNA, "demo-anna", "Anna", 1);
		fixtures.caregiver(DemoIdentityTests.BEN, "demo-ben", "Ben", 2);
		fixtures.member(DemoIdentityTests.ANNA, DemoIdentityTests.FAMILY_A);
		fixtures.member(DemoIdentityTests.BEN, DemoIdentityTests.FAMILY_B);
	}

	@Test
	void storesTheBodyUnderTheCaregiversFamilyAndReturnsIt() {
		put(DemoIdentityTests.ANNA, "{\"note\":\"first\"}").expectStatus().isOk().expectBody(String.class)
			.isEqualTo("{\"note\":\"first\"}");
		assertThat(jdbc.queryForObject("select family_id from dev_echo where id = ?", UUID.class, ID))
			.isEqualTo(DemoIdentityTests.FAMILY_A);
	}

	@Test
	void replayingTheSamePutIsANoOpThatReturnsTheStoredBody() {
		put(DemoIdentityTests.ANNA, "{\"note\":\"first\"}").expectStatus().isOk();
		put(DemoIdentityTests.ANNA, "{\"note\":\"second\"}").expectStatus().isOk().expectBody(String.class)
			.isEqualTo("{\"note\":\"first\"}");
		assertThat(jdbc.queryForObject("select count(*) from dev_echo", Integer.class)).isEqualTo(1);
	}

	@Test
	void anotherFamilyCannotTakeOverTheId() {
		put(DemoIdentityTests.ANNA, "{\"note\":\"first\"}").expectStatus().isOk();
		put(DemoIdentityTests.BEN, "{\"note\":\"mine\"}").expectStatus().isEqualTo(409);
		assertThat(jdbc.queryForObject("select body from dev_echo where id = ?", String.class, ID))
			.isEqualTo("{\"note\":\"first\"}");
	}

	@Test
	void isHiddenFromOpenApi() {
		client.get().uri("/v3/api-docs").exchange().expectStatus().isOk().expectBody(String.class)
			.value(doc -> assertThat(doc).doesNotContain("/dev/echo"));
	}

	@Test
	void isNotARegisteredBeanInLocalOrProd() {
		for (String profile : new String[] { "local", "prod" }) {
			new ApplicationContextRunner().withUserConfiguration(DevEchoController.class)
				.withPropertyValues("spring.profiles.active=" + profile)
				.run(ctx -> assertThat(ctx).doesNotHaveBean(DevEchoController.class));
		}
	}

	private RestTestClient.ResponseSpec put(UUID caregiver, String body) {
		return client.put()
			.uri("/api/v1/dev/echo/" + ID)
			.header("X-Demo-Caregiver", caregiver.toString())
			.contentType(MediaType.APPLICATION_JSON)
			.body(body)
			.exchange();
	}

}
