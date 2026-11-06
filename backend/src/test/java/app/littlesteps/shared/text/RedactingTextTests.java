package app.littlesteps.shared.text;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class RedactingTextTests {

	private static final String SECRET = "Mia hit her brother at the park";

	@Test
	void caregiverTextIsRedactedEverywhereItCouldBePrinted() {
		CaregiverText text = new CaregiverText(SECRET);

		assertThat(text.toString()).isEqualTo("[redacted]");
		assertThat("note: " + text).isEqualTo("note: [redacted]");
		assertThat(String.valueOf(text)).isEqualTo("[redacted]");
		assertThat(String.format("%s", text)).isEqualTo("[redacted]");
		assertThat(java.util.List.of(text).toString()).isEqualTo("[[redacted]]");
	}

	@Test
	void aiTextIsRedactedEverywhereItCouldBePrinted() {
		AiText text = new AiText(SECRET);

		assertThat(text.toString()).isEqualTo("[redacted]");
		assertThat("out: " + text).isEqualTo("out: [redacted]");
		assertThat(String.format("%s", text)).isEqualTo("[redacted]");
	}

	@Test
	void revealReturnsTheContentOnPurpose() {
		assertThat(new CaregiverText(SECRET).reveal()).isEqualTo(SECRET);
		assertThat(new AiText(SECRET).reveal()).isEqualTo(SECRET);
	}

	@Test
	void equalityIsByContentButNotAcrossTypes() {
		assertThat(new CaregiverText("a")).isEqualTo(new CaregiverText("a")).hasSameHashCodeAs(new CaregiverText("a"));
		assertThat(new CaregiverText("a")).isNotEqualTo(new CaregiverText("b"));
		assertThat(new CaregiverText("a")).isNotEqualTo(new AiText("a"));
	}

	@Test
	void jacksonDoesNotSerializeTheContent() {
		var mapper = tools.jackson.databind.json.JsonMapper.builder()
			.disable(tools.jackson.databind.SerializationFeature.FAIL_ON_EMPTY_BEANS)
			.build();

		assertThat(mapper.writeValueAsString(new CaregiverText(SECRET))).doesNotContain(SECRET);
		assertThat(mapper.writeValueAsString(new AiText(SECRET))).doesNotContain(SECRET);
	}

	@Test
	void nullContentIsRejectedWithoutEchoingAnything() {
		assertThatThrownBy(() -> new CaregiverText(null)).isInstanceOf(NullPointerException.class);
		assertThatThrownBy(() -> new AiText(null)).isInstanceOf(NullPointerException.class);
	}

	@Test
	void exceptionMessageBuiltFromTheValueDoesNotLeak() {
		IllegalStateException ex = new IllegalStateException("failed for " + new CaregiverText(SECRET));

		assertThat(ex.getMessage()).doesNotContain(SECRET).contains("[redacted]");
	}

}
