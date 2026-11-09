package app.littlesteps.family.web;

import java.util.Optional;

import app.littlesteps.family.api.CurrentCaregiver;
import jakarta.servlet.http.HttpServletRequest;

/** Source of {@link CurrentCaregiver} for a request. Only the demo one exists until Story 3.1. */
interface CaregiverResolver {

	Optional<CurrentCaregiver> resolve(HttpServletRequest request);

}
