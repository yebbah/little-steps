package app.littlesteps.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.TestFactory;

/**
 * The same files under the {@code guardrail-eval} tag, which the default build excludes (pom.xml). Run it
 * by changing the exclusion in pom.xml locally (or from the IDE); Epic 13 adds model cases here and wires it up.
 */
@Tag("guardrail-eval")
class GuardrailEvalTaggedTest {

	@TestFactory
	List<DynamicTest> everyCase() {
		List<GuardrailEvalRunner.Case> cases = GuardrailEvalRunner.load();
		assertThat(cases).isNotEmpty();
		return cases.stream()
			.map(c -> DynamicTest.dynamicTest(c.file() + ": " + c.name(), () -> GuardrailEvalRunner.run(c)))
			.toList();
	}

}
