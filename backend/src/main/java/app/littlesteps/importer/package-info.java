/**
 * Feature module importer.
 * Allowed dependencies are exactly the AD-1 graph; feature modules also publish platform-defined events (dotted edges).
 */
@ApplicationModule(displayName = "importer", allowedDependencies = {"goals::api", "library::api", "ai::api", "audit::api", "notifications::api", "metrics::api", "privacy::api", "shared"})
package app.littlesteps.importer;

import org.springframework.modulith.ApplicationModule;
