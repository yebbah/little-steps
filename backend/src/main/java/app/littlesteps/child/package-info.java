/**
 * Feature module child.
 * Allowed dependencies are exactly the AD-1 graph; feature modules also publish platform-defined events (dotted edges).
 */
@ApplicationModule(displayName = "child", allowedDependencies = {"family::api", "audit::api", "notifications::api", "metrics::api", "privacy::api", "shared"})
package app.littlesteps.child;

import org.springframework.modulith.ApplicationModule;
