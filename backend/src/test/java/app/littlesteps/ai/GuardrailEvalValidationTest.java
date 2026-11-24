package app.littlesteps.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

/** The eval runner refuses malformed cases instead of passing or failing them for the wrong reason. */
class GuardrailEvalValidationTest {

	private static final String OK = """
			cases:
			  - name: ok
			    tags: [guardrail-eval]
			    steps:
			      - scope: family
			        items:
			          - { kind: activity, origin: curated, text: "Blocks" }
			        expect:
			          - { outcome: keep }
			""";

	private static void refused(String yaml, String message) {
		assertThatThrownBy(() -> GuardrailEvalRunner.parse("fixture.yaml", yaml))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessageContaining(message);
	}

	@Test
	void aWellFormedCaseIsAccepted() {
		assertThat(GuardrailEvalRunner.parse("fixture.yaml", OK)).hasSize(1);
	}

	@Test
	void anUnknownScopeIsRefused() {
		refused(OK.replace("scope: family", "scope: goal-c"), "scope");
	}

	@Test
	void anUnknownKeyIsRefused() {
		refused(OK.replace("scope: family", "scope: family\n        scoope: x"), "unknown key 'scoope'");
		refused(OK.replace("- name: ok", "- name: ok\n    taggs: []"), "unknown key 'taggs'");
	}

	@Test
	void aMissingOutcomeIsRefused() {
		refused(OK.replace("{ outcome: keep }", "{ flags: [] }"), "outcome");
	}

	@Test
	void missingItemsAreRefused() {
		refused(OK.replace("        items:\n          - { kind: activity, origin: curated, text: \"Blocks\" }\n", ""), "items");
	}

	@Test
	void aCountMismatchIsRefused() {
		refused(OK.replace("- { outcome: keep }", "- { outcome: keep }\n          - { outcome: drop }"),
				"1 items but 2");
	}

	@Test
	void anUnknownOriginKindOrFlagIsRefused() {
		refused(OK.replace("curated", "invented"), "origin");
		refused(OK.replace("activity", "poem"), "kind");
		refused(OK.replace("{ outcome: keep }", "{ outcome: keep, flags: [oops] }"), "flag");
	}

	@Test
	void anEmptyFileOrNoStepsIsRefused() {
		refused("cases: []", "cases");
		refused("something: else", "cases");
		refused("cases:\n  - name: x\n    steps: []\n", "at least one step");
	}

}
