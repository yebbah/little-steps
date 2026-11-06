/**
 * Platform module notifications.
 * Allowed dependencies are exactly the AD-1 graph; platform modules depend on shared only.
 */
@ApplicationModule(displayName = "notifications", allowedDependencies = {"shared"})
package app.littlesteps.notifications;

import org.springframework.modulith.ApplicationModule;
