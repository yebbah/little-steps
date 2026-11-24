package app.littlesteps.ai.api;

import java.util.List;
import java.util.Objects;

/** What the Guardrail decided for one item: kept or dropped, and the flags a kept item carries. */
public record GuardrailDecision(GuardrailItem item, Outcome outcome, List<Flag> flags) {

	/** Whether the item may reach the screen. */
	public enum Outcome {

		KEEP, DROP

	}

	/** A code the app turns into catalog copy; the server never sends the sentence. */
	public enum Flag {

		/** The item matches a recorded Restriction ("conflicts with a recorded Restriction, check with your therapist"). */
		RESTRICTION_CONFLICT("restriction-conflict"),
		/** The scope classifier asks the Caregiver to check with the therapist. */
		CHECK_WITH_THERAPIST("check-with-therapist"),
		/** The check could not run, so a prescribed item is kept but not cleared. */
		CHECK_UNAVAILABLE("check-unavailable");

		private final String code;

		Flag(String code) {
			this.code = code;
		}

		public String code() {
			return code;
		}

	}

	public GuardrailDecision {
		Objects.requireNonNull(item, "item");
		Objects.requireNonNull(outcome, "outcome");
		flags = List.copyOf(flags);
	}

	public boolean kept() {
		return outcome == Outcome.KEEP;
	}

}
