package app.littlesteps.ai.api;

import java.util.List;

/**
 * Checks items against the Family's recorded Restrictions and "avoid" sensitivities before they reach
 * Today (AD-11). Deterministic and fails closed: an item that cannot be checked is dropped, except a
 * prescribed one, which is kept with a flag.
 */
public interface Guardrail {

	/** One decision per item, in the order given. Never throws. */
	List<GuardrailDecision> check(List<GuardrailItem> items, GuardrailScope scope);

	/** The items that may be shown, with their decisions, dropped ones removed. */
	default List<GuardrailDecision> allowed(List<GuardrailItem> items, GuardrailScope scope) {
		return check(items, scope).stream().filter(GuardrailDecision::kept).toList();
	}

}
