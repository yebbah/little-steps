package app.littlesteps.family.web;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import app.littlesteps.family.persistence.CaregiverMembershipRepository;
import app.littlesteps.family.persistence.CaregiverRepository;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

/** The demo resolver is absent in prod, and the app does not start with the flag on there. */
class DemoGuardTests {

	private final ApplicationContextRunner runner = new ApplicationContextRunner()
		.withUserConfiguration(DemoGuard.class, DemoConfiguration.class)
		.withBean(CaregiverRepository.class, () -> Mockito.mock(CaregiverRepository.class))
		.withBean(CaregiverMembershipRepository.class, () -> Mockito.mock(CaregiverMembershipRepository.class));

	@Test
	void flagOnInProdFailsTheStart() {
		runner.withPropertyValues("spring.profiles.active=prod", "littlesteps.demo.enabled=true")
			.run(ctx -> assertThat(ctx).hasFailed());
	}

	@Test
	void flagOnWithNoProfileFailsTheStart() {
		runner.withPropertyValues("littlesteps.demo.enabled=true").run(ctx -> assertThat(ctx).hasFailed());
	}

	@Test
	void flagOnWithProdAndLocalFailsTheStart() {
		runner.withPropertyValues("spring.profiles.active=local,prod", "littlesteps.demo.enabled=true")
			.run(ctx -> assertThat(ctx).hasFailed());
	}

	@Test
	void flagOffInProdStartsWithoutTheDemoResolver() {
		runner.withPropertyValues("spring.profiles.active=prod").run(ctx -> {
			assertThat(ctx).hasNotFailed();
			assertThat(ctx).doesNotHaveBean(DemoCaregiverResolver.class);
		});
	}

	@Test
	void flagOnInLocalAndTestHasTheDemoResolver() {
		for (String profile : new String[] { "local", "test" }) {
			runner.withPropertyValues("spring.profiles.active=" + profile, "littlesteps.demo.enabled=true")
				.run(ctx -> assertThat(ctx).hasNotFailed().hasSingleBean(DemoCaregiverResolver.class));
		}
	}

	@Test
	void flagOffInLocalHasNoDemoResolver() {
		runner.withPropertyValues("spring.profiles.active=local")
			.run(ctx -> assertThat(ctx).hasNotFailed().doesNotHaveBean(DemoCaregiverResolver.class));
	}

}
