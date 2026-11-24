package app.littlesteps.ai.domain;

import app.littlesteps.ai.api.GuardrailItem;
import app.littlesteps.ai.api.ScopeClassifier;

/**
 * The classifier used until Epic 13 supplies one: clear for items that are not AI-made, unavailable for
 * AI-made ones, so those are dropped (fail closed). Not a bean, so a real classifier replaces it simply
 * by being one.
 */
final class DefaultScopeClassifier implements ScopeClassifier {

	@Override
	public Answer classify(GuardrailItem item) {
		return item.origin() == GuardrailItem.Origin.AI_SUGGESTED ? Answer.UNAVAILABLE : Answer.CLEAR;
	}

}
