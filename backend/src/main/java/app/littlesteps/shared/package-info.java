/**
 * Shared kernel: IDs, {@code FamilyCalendar}, {@code StoragePort}, the problem-type registry and the
 * redacting value types (AD-1). Every module may use it; it depends on no other module.
 */
@ApplicationModule(type = ApplicationModule.Type.OPEN, allowedDependencies = {})
package app.littlesteps.shared;

import org.springframework.modulith.ApplicationModule;
