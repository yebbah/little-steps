/**
 * Feature module planning.
 * Allowed dependencies are exactly the AD-1 graph; feature modules also publish platform-defined events (dotted edges).
 */
@ApplicationModule(displayName = "planning", allowedDependencies = {"goals::api", "library::api", "practice::api", "audit::api", "notifications::api", "metrics::api", "privacy::api", "shared"})
package app.littlesteps.planning;

import org.springframework.modulith.ApplicationModule;
