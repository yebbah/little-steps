/**
 * Platform module audit.
 * Allowed dependencies are exactly the AD-1 graph; platform modules depend on shared only.
 */
@ApplicationModule(displayName = "audit", allowedDependencies = {"shared"})
package app.littlesteps.audit;

import org.springframework.modulith.ApplicationModule;
