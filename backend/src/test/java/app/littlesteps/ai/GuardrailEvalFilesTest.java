package app.littlesteps.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;

/** Story 25.4: runs every case in {@code eval/guardrails/*.yaml} that needs no model, in the default build. */
class GuardrailEvalFilesTest {

	@TestFactory
	List<DynamicTest> everyCaseThatNeedsNoModel() {
		List<GuardrailEvalRunner.Case> cases = GuardrailEvalRunner.load();
		assertThat(cases).isNotEmpty();
		return cases.stream()
			.filter(c -> !c.needsModel())
			.map(c -> DynamicTest.dynamicTest(c.file() + ": " + c.name(), () -> GuardrailEvalRunner.run(c)))
			.toList();
	}

}
