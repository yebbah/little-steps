package app.littlesteps.child.api;

import java.util.List;
import java.util.UUID;

/**
 * The Family's Child Profile sensitivities marked "avoid", read live each call (no copy). Used by the
 * Guardrail's Restriction set (AD-11).
 */
public interface AvoidSensitivities {

	/** In profile order; empty when there is no profile or none is marked "avoid". */
	List<AvoidSensitivity> list();

	/** One sensitivity marked "avoid". */
	record AvoidSensitivity(UUID id, String text) {
	}

}
