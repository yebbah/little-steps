/**
 * Platform module metrics.
 * Allowed dependencies are exactly the AD-1 graph; platform modules depend on shared only.
 */
@ApplicationModule(displayName = "metrics", allowedDependencies = {"shared"})
package app.littlesteps.metrics;

import org.springframework.modulith.ApplicationModule;
