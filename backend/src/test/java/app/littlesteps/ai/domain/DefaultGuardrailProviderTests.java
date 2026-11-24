package app.littlesteps.ai.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;

import app.littlesteps.ai.api.GuardrailDecision;
import app.littlesteps.ai.api.GuardrailDecision.Flag;
import app.littlesteps.ai.api.GuardrailDecision.Outcome;
import app.littlesteps.ai.api.GuardrailItem;
import app.littlesteps.ai.api.GuardrailItem.Kind;
import app.littlesteps.ai.api.GuardrailItem.Origin;
import app.littlesteps.ai.api.GuardrailScope;
import app.littlesteps.ai.api.RestrictionLookup;
import app.littlesteps.ai.api.ScopeClassifier;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;

/** The Spring constructor: a classifier provider that fails must fail closed. */
class DefaultGuardrailProviderTests {

	private static final ObjectProvider<ScopeClassifier> BROKEN = new ObjectProvider<>() {
		@Override
		public ScopeClassifier getObject(Object... args) {
			throw new IllegalStateException("two classifiers");
		}

		@Override
		public ScopeClassifier getObject() {
			throw new IllegalStateException("two classifiers");
		}

		@Override
		public ScopeClassifier getIfAvailable() {
			throw new IllegalStateException("two classifiers");
		}

		@Override
		public ScopeClassifier getIfUnique() {
			throw new IllegalStateException("two classifiers");
		}
	};

	private static GuardrailItem item(Origin origin) {
		return new GuardrailItem(UUID.randomUUID(), Kind.COACH_TIP, origin, "Offer a choice");
	}

	@Test
	void aFailingProviderDropsAiAndCuratedItemsAndFlagsAPrescribedOne() {
		RestrictionLookup lookup = goalId -> new RestrictionLookup.RestrictionSet(UUID.randomUUID(), "v", List.of());
		DefaultGuardrail guardrail = new DefaultGuardrail(lookup, BROKEN);
		List<GuardrailDecision> decisions = guardrail.check(
				List.of(item(Origin.AI_SUGGESTED), item(Origin.CURATED), item(Origin.PRESCRIBED)),
				GuardrailScope.family());
		assertThat(decisions).extracting(GuardrailDecision::outcome)
			.containsExactly(Outcome.DROP, Outcome.DROP, Outcome.KEEP);
		assertThat(decisions.get(2).flags()).containsExactly(Flag.CHECK_UNAVAILABLE);
	}

	@Test
	void anAbsentProviderUsesTheDefaultClassifier() {
		RestrictionLookup lookup = goalId -> new RestrictionLookup.RestrictionSet(UUID.randomUUID(), "v", List.of());
		ObjectProvider<ScopeClassifier> none = new ObjectProvider<>() {
			@Override
			public ScopeClassifier getObject(Object... args) {
				return null;
			}

			@Override
			public ScopeClassifier getObject() {
				return null;
			}

			@Override
			public ScopeClassifier getIfAvailable() {
				return null;
			}

			@Override
			public ScopeClassifier getIfUnique() {
				return null;
			}
		};
		List<GuardrailDecision> decisions = new DefaultGuardrail(lookup, none)
			.check(List.of(item(Origin.AI_SUGGESTED), item(Origin.CURATED)), GuardrailScope.family());
		assertThat(decisions).extracting(GuardrailDecision::outcome).containsExactly(Outcome.DROP, Outcome.KEEP);
	}

}
