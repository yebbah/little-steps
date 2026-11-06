/**
 * Platform module privacy.
 * Allowed dependencies are exactly the AD-1 graph; platform modules depend on shared only.
 */
@ApplicationModule(displayName = "privacy", allowedDependencies = {"shared"})
package app.littlesteps.privacy;

import org.springframework.modulith.ApplicationModule;
