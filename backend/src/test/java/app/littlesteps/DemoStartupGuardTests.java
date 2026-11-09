package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;

/**
 * Boots the real application with LS_DEMO set (the environment name, so the mapping in
 * application.properties is exercised) and checks that the start fails because of the guard, not
 * because of the datasource.
 */
class DemoStartupGuardTests extends IntegrationTest {

	@Value("${spring.datasource.url}")
	private String url;

	@Value("${spring.datasource.username}")
	private String username;

	@Value("${spring.datasource.password}")
	private String password;

	@Test
	void prodWithTheFlagOnFailsToStartBecauseOfTheGuard() {
		assertThatThrownBy(() -> start("prod")).satisfies(DemoStartupGuardTests::isTheGuard);
	}

	@Test
	void noProfileWithTheFlagOnFailsToStartBecauseOfTheGuard() {
		assertThatThrownBy(() -> start()).satisfies(DemoStartupGuardTests::isTheGuard);
	}

	@Test
	void prodWithTheFlagOffStarts() {
		try (var ctx = new SpringApplicationBuilder(LittlestepsApplication.class).web(WebApplicationType.SERVLET)
			.profiles("prod")
			.properties(properties("false"))
			.run()) {
			assertThat(ctx.isRunning()).isTrue();
			assertThat(ctx.getBeanNamesForType(Object.class)).doesNotContain("demoCaregiverResolver");
		}
	}

	private void start(String... profiles) {
		new SpringApplicationBuilder(LittlestepsApplication.class).web(WebApplicationType.SERVLET)
			.profiles(profiles)
			.properties(properties("true"))
			.run()
			.close();
	}

	private String[] properties(String demo) {
		List<String> p = new ArrayList<>();
		p.add("LS_DEMO=" + demo);
		p.add("server.port=0");
		p.add("spring.datasource.url=" + url);
		p.add("spring.datasource.username=" + username);
		p.add("spring.datasource.password=" + password);
		// The shared test database already holds test-only migrations; only the guard is under test.
		p.add("spring.flyway.enabled=false");
		p.add("spring.jpa.hibernate.ddl-auto=none");
		return p.toArray(String[]::new);
	}

	private static void isTheGuard(Throwable failure) {
		for (Throwable t = failure; t != null; t = t.getCause()) {
			if (t instanceof IllegalStateException && String.valueOf(t.getMessage()).contains("littlesteps.demo.enabled")) {
				return;
			}
		}
		throw new AssertionError("The start did not fail because of the demo guard", failure);
	}

}
