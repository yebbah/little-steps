package app.littlesteps.shared.web;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;

class ProblemTypesTests {

	@Test
	void everyTypeHasAUniqueUrnAndAStatus() {
		assertThat(Arrays.stream(ProblemTypes.values()).map(t -> t.uri().toString()).collect(Collectors.toSet()))
			.hasSize(ProblemTypes.values().length)
			.allMatch(uri -> uri.startsWith("urn:littlesteps:problem:"));
		assertThat(ProblemTypes.NOT_FOUND.uri().toString()).isEqualTo("urn:littlesteps:problem:not-found");
	}

	@Test
	void unmappedStatusesFallBackSafely() {
		assertThat(ProblemTypes.forStatus(404)).isEqualTo(ProblemTypes.NOT_FOUND);
		assertThat(ProblemTypes.forStatus(503)).isEqualTo(ProblemTypes.UNAVAILABLE);
		assertThat(ProblemTypes.forStatus(504)).isEqualTo(ProblemTypes.INTERNAL);
		assertThat(ProblemTypes.forStatus(418)).isEqualTo(ProblemTypes.MALFORMED_REQUEST);
	}

}
