/**
 * Feature module practice.
 * Allowed dependencies are exactly the AD-1 graph; feature modules also publish platform-defined events (dotted edges).
 */
@ApplicationModule(displayName = "practice", allowedDependencies = {"goals::api", "library::api", "careteam::api", "audit::api", "notifications::api", "metrics::api", "privacy::api", "shared"})
package app.littlesteps.practice;

import org.springframework.modulith.ApplicationModule;
