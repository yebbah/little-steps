package app.littlesteps.shared.text;

import java.util.Objects;

/**
 * Free text written by a Caregiver (an Observation, a nickname, a note). Its {@link #toString()}
 * returns {@code [redacted]} so that string concatenation, logging and exception messages can
 * never write the content (AD-19). Read the content with {@link #reveal()} only where it is stored
 * or shown on purpose.
 */
public final class CaregiverText {

	private final String value;

	public CaregiverText(String value) {
		this.value = Objects.requireNonNull(value, "value");
	}

	/** The raw content. Never pass the result to a logger or an exception message. */
	public String reveal() {
		return value;
	}

	@Override
	public String toString() {
		return Redaction.PLACEHOLDER;
	}

	@Override
	public boolean equals(Object other) {
		return other instanceof CaregiverText that && value.equals(that.value);
	}

	@Override
	public int hashCode() {
		return value.hashCode();
	}

}
