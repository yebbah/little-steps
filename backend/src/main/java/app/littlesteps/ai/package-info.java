/**
 * Platform module ai.
 * Allowed dependencies are exactly the AD-1 graph; platform modules depend on shared only.
 */
@ApplicationModule(displayName = "ai", allowedDependencies = {"shared"})
package app.littlesteps.ai;

import org.springframework.modulith.ApplicationModule;
