/**
 * Feature module progress.
 * Allowed dependencies are exactly the AD-1 graph; feature modules also publish platform-defined events (dotted edges).
 */
@ApplicationModule(displayName = "progress", allowedDependencies = {"practice::api", "goals::api", "ai::api", "audit::api", "notifications::api", "metrics::api", "privacy::api", "shared"})
package app.littlesteps.progress;

import org.springframework.modulith.ApplicationModule;
