package app.littlesteps.family.web;

import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;

/** Stops the start when the demo flag is on outside the {@code local} and {@code test} profiles. */
@Component
class DemoGuard {

	DemoGuard(Environment env) {
		boolean on = env.getProperty("littlesteps.demo.enabled", Boolean.class, false);
		boolean allowed = env.acceptsProfiles(Profiles.of("local | test")) && !env.acceptsProfiles(Profiles.of("prod"));
		if (on && !allowed) {
			throw new IllegalStateException(
					"littlesteps.demo.enabled (LS_DEMO) is on, but the active profile is not local or test. Demo identity is never allowed in production.");
		}
	}

}
