package app.littlesteps.ai.api;

import java.util.Objects;
import java.util.UUID;

/**
 * Something the app is about to show: its id, its kind, where it came from and the text to search.
 * {@code origin} decides what happens on a conflict: a prescribed item is never dropped.
 */
public record GuardrailItem(UUID id, Kind kind, Origin origin, String text) {

	/** What the item is. */
	public enum Kind {

		ACTIVITY, PLAN_ITEM, PREP_CARD, COACH_TIP

	}

	/** Where the item came from. */
	public enum Origin {

		CURATED, PRESCRIBED, AI_SUGGESTED

	}

	public GuardrailItem {
		Objects.requireNonNull(id, "id");
		Objects.requireNonNull(kind, "kind");
		Objects.requireNonNull(origin, "origin");
		text = text == null ? "" : text;
	}

}
