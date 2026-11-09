package app.littlesteps.family.web;

import app.littlesteps.family.persistence.CaregiverMembershipRepository;
import app.littlesteps.family.persistence.CaregiverRepository;
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

	@Bean
	DemoCaregiverResolver demoCaregiverResolver(CaregiverRepository caregivers,
			CaregiverMembershipRepository memberships) {
		return new DemoCaregiverResolver(caregivers, memberships);
	}

}
