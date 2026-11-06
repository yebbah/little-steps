/**
 * Feature module summary.
 * Allowed dependencies are exactly the AD-1 graph; feature modules also publish platform-defined events (dotted edges).
 */
@ApplicationModule(displayName = "summary", allowedDependencies = {"progress::api", "goals::api", "careteam::api", "ai::api", "audit::api", "notifications::api", "metrics::api", "privacy::api", "shared"})
package app.littlesteps.summary;

import org.springframework.modulith.ApplicationModule;
