package app.littlesteps.ai.api;

/**
 * Decides whether an item is within what the app may suggest. A port: Epic 13 supplies a real one. The
 * default answers clear for items that are not AI-made and unavailable for AI-made ones.
 */
public interface ScopeClassifier {

	Answer classify(GuardrailItem item);

	/** The classifier's answer. */
	enum Answer {

		CLEAR, CHECK_WITH_THERAPIST, UNAVAILABLE

	}

}
