/**
 * Feature module family.
 * Allowed dependencies are exactly the AD-1 graph; feature modules also publish platform-defined events (dotted edges).
 */
@ApplicationModule(displayName = "family", allowedDependencies = {"audit::api", "notifications::api", "metrics::api", "privacy::api", "shared"})
package app.littlesteps.family;

import org.springframework.modulith.ApplicationModule;
