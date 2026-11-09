package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.sql.DataSource;

import app.littlesteps.shared.persistence.TenantContext;
import app.littlesteps.tenantprobe.TenantProbe;
import app.littlesteps.tenantprobe.TenantProbeRepository;
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

/** NFR-4: two Families, each with one Caregiver; neither reads nor changes the other's rows. */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT, properties = "littlesteps.demo.enabled=true")
@AutoConfigureRestTestClient
class TenantIsolationTests extends IntegrationTest {

	private static final ParameterizedTypeReference<List<Map<String, Object>>> LIST = new ParameterizedTypeReference<>() {
	};

	private static final UUID PROBE_A = UUID.fromString("0190a000-0000-7000-8000-000000000a0a");

	private static final UUID PROBE_B = UUID.fromString("0190a000-0000-7000-8000-000000000b0b");

	@Autowired
	private RestTestClient client;

	@Autowired
	private DataSource dataSource;

	@Autowired
	private TenantProbeRepository probes;

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
		put(DemoIdentityTests.ANNA, PROBE_A, "a-row").expectStatus().isOk();
		put(DemoIdentityTests.BEN, PROBE_B, "b-row").expectStatus().isOk();
	}

	@Test
	void eachFamilyListsOnlyItsOwnRows() {
		assertThat(list(DemoIdentityTests.ANNA)).extracting(r -> r.get("label")).containsExactly("a-row");
		assertThat(list(DemoIdentityTests.BEN)).extracting(r -> r.get("label")).containsExactly("b-row");
	}

	@Test
	void rowsAreStoredUnderTheTenantOfTheCaregiverNotARequestValue() {
		assertThat(jdbc.queryForObject("select family_id from tenant_probe where id = ?", UUID.class, PROBE_A))
			.isEqualTo(DemoIdentityTests.FAMILY_A);
		assertThat(jdbc.queryForObject("select family_id from tenant_probe where id = ?", UUID.class, PROBE_B))
			.isEqualTo(DemoIdentityTests.FAMILY_B);
	}

	@Test
	void anotherFamilysRowByIdIsNotFound() {
		client.get().uri("/api/v1/test-probes/" + PROBE_B).header("X-Demo-Caregiver", DemoIdentityTests.ANNA.toString())
			.exchange().expectStatus().isNotFound();
		client.get().uri("/api/v1/test-probes/" + PROBE_A).header("X-Demo-Caregiver", DemoIdentityTests.BEN.toString())
			.exchange().expectStatus().isNotFound();
	}

	@Test
	void aCrossWriteIsRejectedAndTheOtherFamilysRowIsUnchanged() {
		put(DemoIdentityTests.ANNA, PROBE_B, "hijacked").expectStatus().isEqualTo(409);
		assertThat(jdbc.queryForObject("select label from tenant_probe where id = ?", String.class, PROBE_B))
			.isEqualTo("b-row");
		assertThat(jdbc.queryForObject("select family_id from tenant_probe where id = ?", UUID.class, PROBE_B))
			.isEqualTo(DemoIdentityTests.FAMILY_B);
	}

	@Test
	void namingAnotherFamilyOnTheEntityIsRejectedAndStoresNothing() {
		UUID id = UUID.randomUUID();
		Throwable rejected;
		try (var scope = TenantContext.open(DemoIdentityTests.FAMILY_A)) {
			rejected = tryCrossSave(id);
		}
		assertThat(rejected).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class)
			.hasMessageContaining("assigned tenant id differs from current tenant id");
		assertThat(jdbc.queryForObject("select count(*) from tenant_probe where id = ?", Integer.class, id)).isZero();
	}

	@Test
	void withNoTenantTheRepositoryReadsNothingAndWritesNothing() {
		assertThat(TenantContext.current()).isEmpty();
		assertThat(probes.findAll()).isEmpty();
		org.assertj.core.api.Assertions
			.assertThatThrownBy(() -> probes.saveAndFlush(new TenantProbe(UUID.randomUUID(), "orphan")))
			.isInstanceOf(RuntimeException.class);
	}

	private Throwable tryCrossSave(UUID id) {
		try {
			probes.saveAndFlush(new TenantProbe(id, DemoIdentityTests.FAMILY_B, "sneaky"));
			return null;
		}
		catch (RuntimeException ex) {
			return ex;
		}
	}

	private RestTestClient.ResponseSpec put(UUID caregiver, UUID id, String label) {
		return client.put()
			.uri("/api/v1/test-probes/" + id)
			.header("X-Demo-Caregiver", caregiver.toString())
			.contentType(MediaType.APPLICATION_JSON)
			.body(Map.of("label", label))
			.exchange();
	}

	private List<Map<String, Object>> list(UUID caregiver) {
		return client.get()
			.uri("/api/v1/test-probes")
			.header("X-Demo-Caregiver", caregiver.toString())
			.exchange()
			.expectStatus()
			.isOk()
			.expectBody(LIST)
			.returnResult()
			.getResponseBody();
	}

}
