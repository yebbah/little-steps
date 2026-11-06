/**
 * Feature module library.
 * Allowed dependencies are exactly the AD-1 graph; feature modules also publish platform-defined events (dotted edges).
 */
@ApplicationModule(displayName = "library", allowedDependencies = {"goals::api", "child::api", "ai::api", "audit::api", "notifications::api", "metrics::api", "privacy::api", "shared"})
package app.littlesteps.library;

import org.springframework.modulith.ApplicationModule;
