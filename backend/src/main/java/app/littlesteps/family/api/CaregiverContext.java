package app.littlesteps.family.api;

import java.util.Optional;

/** Port: the Caregiver of the current request, or none. Story 3.1 supplies it from the Keycloak token. */
public interface CaregiverContext {

	Optional<CurrentCaregiver> current();

}
