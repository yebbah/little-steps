package app.littlesteps.family.web;

import app.littlesteps.family.persistence.CaregiverMembershipRepository;
import app.littlesteps.family.persistence.CaregiverRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * The demo resolver exists only with the flag on, and only in {@code local} or {@code test}. In
 * {@code prod} (or with no profile) it is not a bean, so the header cannot be read at all.
 */
@Configuration(proxyBeanMethods = false)
@Profile({ "local", "test" })
@ConditionalOnProperty(name = "littlesteps.demo.enabled", havingValue = "true")
class DemoConfiguration {

	/** Logged at start so nobody runs with header impersonation on without seeing it. */
	static final String WARNING = "DEMO IDENTITY ON: any caller can act as any Caregiver with the X-Demo-Caregiver header. Never expose this app to other devices or the internet (Tailscale Funnel, shared tailnet) while LS_DEMO is on.";

	private static final Logger log = LoggerFactory.getLogger(DemoConfiguration.class);

	@Bean
	DemoCaregiverResolver demoCaregiverResolver(CaregiverRepository caregivers,
			CaregiverMembershipRepository memberships) {
		log.warn(WARNING);
		return new DemoCaregiverResolver(caregivers, memberships);
	}

}
