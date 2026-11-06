/**
 * Feature module goals.
 * Allowed dependencies are exactly the AD-1 graph; feature modules also publish platform-defined events (dotted edges).
 */
@ApplicationModule(displayName = "goals", allowedDependencies = {"careteam::api", "child::api", "ai::api", "audit::api", "notifications::api", "metrics::api", "privacy::api", "shared"})
package app.littlesteps.goals;

import org.springframework.modulith.ApplicationModule;
