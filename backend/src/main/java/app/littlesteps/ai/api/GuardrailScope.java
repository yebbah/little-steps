package app.littlesteps.ai.api;

import java.util.UUID;

/** What an item is checked for: one Goal's Restrictions and the Family's, or the Family's alone. */
public record GuardrailScope(UUID goalId) {

	/** Only the Family-level Restrictions and "avoid" sensitivities apply. */
	public static GuardrailScope family() {
		return new GuardrailScope(null);
	}

	public static GuardrailScope goal(UUID goalId) {
		return new GuardrailScope(java.util.Objects.requireNonNull(goalId));
	}

}
