package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.env.Environment;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.modulith.events.IncompleteEventPublications;
import org.springframework.transaction.support.TransactionTemplate;

/** Flyway, the real database and the event publication registry, against Testcontainers PostgreSQL. */
@Import(PersistenceBaselineTests.FlakyListenerConfig.class)
class PersistenceBaselineTests extends IntegrationTest {

	record Ping(String id) {
	}

	static final AtomicInteger attempts = new AtomicInteger();

	@TestConfiguration(proxyBeanMethods = false)
	static class FlakyListenerConfig {

		@Bean
		FlakyListener flakyListener() {
			return new FlakyListener();
		}

	}

	static class FlakyListener {

		@ApplicationModuleListener
		void on(Ping ping) {
			if (attempts.incrementAndGet() == 1) {
				throw new IllegalStateException("first delivery fails");
			}
		}

	}

	@Autowired
	DataSource dataSource;

	@Autowired
	ApplicationEventPublisher events;

	@Autowired
	TransactionTemplate tx;

	@Autowired
	IncompleteEventPublications incomplete;

	@Autowired
	Environment env;

	@Test
	void runsOnRealPostgresqlNotH2() {
		JdbcTemplate jdbc = new JdbcTemplate(dataSource);
		assertThat(jdbc.queryForObject("select version()", String.class)).startsWith("PostgreSQL");
	}

	@Test
	void flywayCreatesTheRegistryTheFamilyTablesAndTheTestTables() {
		JdbcTemplate jdbc = new JdbcTemplate(dataSource);
		List<String> tables = jdbc.queryForList(
				"select table_name from information_schema.tables where table_schema = 'public' order by 1",
				String.class);
		assertThat(tables).containsExactly("caregiver_membership", "caregivers", "dev_echo", "event_publication", "families",
				"flyway_schema_history", "tenant_probe");
		assertThat(jdbc.queryForObject("select count(*) from flyway_schema_history where success", Integer.class))
			.isEqualTo(4);
	}

	@Test
	void incompletePublicationsAreResubmittedOnRestart() {
		assertThat(env.getProperty("spring.modulith.events.republish-outstanding-events-on-restart"))
			.isEqualTo("true");
		attempts.set(0);
		tx.executeWithoutResult(s -> events.publishEvent(new Ping("p1")));

		// The first delivery fails, so the publication stays incomplete in the registry.
		await().atMost(Duration.ofSeconds(10)).until(() -> attempts.get() >= 1);
		JdbcTemplate jdbc = new JdbcTemplate(dataSource);
		await().atMost(Duration.ofSeconds(10))
			.untilAsserted(() -> assertThat(jdbc.queryForObject(
					"select count(*) from event_publication where completion_date is null", Integer.class))
				.isEqualTo(1));

		// What the startup hook does: resubmit everything incomplete. The second delivery succeeds.
		incomplete.resubmitIncompletePublications(p -> true);
		await().atMost(Duration.ofSeconds(10))
			.untilAsserted(() -> assertThat(jdbc.queryForObject(
					"select count(*) from event_publication where completion_date is null", Integer.class))
				.isZero());
		assertThat(attempts.get()).isEqualTo(2);
	}

}
