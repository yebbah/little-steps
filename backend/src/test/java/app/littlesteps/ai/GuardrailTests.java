package app.littlesteps.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import app.littlesteps.ai.api.GuardrailDecision;
import app.littlesteps.ai.api.GuardrailDecision.Flag;
import app.littlesteps.ai.api.GuardrailDecision.Outcome;
import app.littlesteps.ai.api.GuardrailItem;
import app.littlesteps.ai.api.GuardrailItem.Kind;
import app.littlesteps.ai.api.GuardrailItem.Origin;
import app.littlesteps.ai.api.GuardrailScope;
import app.littlesteps.ai.api.RestrictionLookup;
import app.littlesteps.ai.api.RestrictionLookup.Rule;
import app.littlesteps.ai.api.RestrictionLookup.Source;
import app.littlesteps.ai.api.ScopeClassifier;
import app.littlesteps.ai.api.ScopeClassifier.Answer;
import app.littlesteps.ai.domain.DefaultGuardrail;
import org.junit.jupiter.api.Test;

/** Story 25.4: matching, outcomes, fail-closed behaviour and the cache, without a database. */
class GuardrailTests {

	private static final UUID FAMILY = UUID.randomUUID();

	private final List<Rule> rules = new ArrayList<>();

	private String version = "v1";

	private final AtomicInteger lookups = new AtomicInteger();

	private boolean lookupThrows;

	private final RestrictionLookup lookup = goalId -> {
		lookups.incrementAndGet();
		if (lookupThrows) {
			throw new IllegalStateException("down");
		}
		return new RestrictionLookup.RestrictionSet(FAMILY, version, rules);
	};

	private Rule restriction(String text, String... terms) {
		Rule r = new Rule(Source.RESTRICTION, UUID.randomUUID(), List.of(text), List.of(terms));
		rules.add(r);
		return r;
	}

	private static GuardrailItem item(Origin origin, String text) {
		return new GuardrailItem(UUID.randomUUID(), Kind.ACTIVITY, origin, text);
	}

	private GuardrailDecision check(DefaultGuardrail g, GuardrailItem item) {
		return g.check(List.of(item), GuardrailScope.family()).get(0);
	}

	private boolean dropped(String restrictionText, String itemText) {
		rules.clear();
		restriction(restrictionText);
		return check(new DefaultGuardrail(lookup, (ScopeClassifier) null), item(Origin.CURATED, itemText))
			.outcome() == Outcome.DROP;
	}

	@Test
	void leadingAvoidWordsAreRemovedFromTheTarget() {
		for (String text : List.of("No hand-over-hand prompting", "Avoid hand over hand prompting",
				"Don't hand-over-hand prompting", "Do not hand-over-hand prompting",
				"Never hand-over-hand prompting", "Without hand-over-hand prompting",
				"Stop hand-over-hand prompting", "NOT hand-over-hand prompting", "don’t hand-over-hand prompting")) {
			assertThat(dropped(text, "Uses hand-over-hand prompting at the table")).as(text).isTrue();
		}
	}

	@Test
	void aTargetMatchesOnWholeWordsOnly() {
		assertThat(dropped("No hand-over-hand", "handing out cards")).isFalse();
		assertThat(dropped("No hand over hand", "handing out cards")).isFalse();
		assertThat(dropped("No hand", "Handstand time")).isFalse();
		assertThat(dropped("No hand", "Use your hand")).isTrue();
		assertThat(dropped("No bell", "A bellow")).isFalse();
	}

	@Test
	void textIsCaseAndPunctuationAndPluralInsensitive() {
		assertThat(dropped("No sticky TEXTURES", "A sticky texture, board")).isTrue();
		assertThat(dropped("No box", "Open the boxes")).isTrue();
		assertThat(dropped("No story", "Read two stories")).isTrue();
		assertThat(dropped("No toys", "A toy")).isTrue();
		assertThat(dropped("No glass", "Glasses of water")).isTrue();
		assertThat(dropped("No hand-over-hand", "hand—over—hand")).isTrue();
	}

	@Test
	void aRestrictionWithOnlyAvoidWordsUsesItsWholeTextAsTheTarget() {
		assertThat(dropped("No", "Say no to a snack")).isTrue();
		assertThat(dropped("No", "Blocks")).isFalse();
		assertThat(dropped("Do not", "Please do not touch")).isTrue();
	}

	@Test
	void aLeadInVerbIsRemoved() {
		assertThat(dropped("Don't use flashcards", "Flashcards of animals")).isTrue();
		assertThat(dropped("Please do not allow screens", "Screen time")).isTrue();
		assertThat(dropped("Cannot give sweets", "Hand out sweet")).isTrue();
		assertThat(dropped("Don't use flashcards", "Animal book")).isFalse();
	}

	@Test
	void aListIsSplitIntoSeparateTargets() {
		assertThat(dropped("No bubbles or whistles", "Blowing bubbles")).isTrue();
		assertThat(dropped("No bubbles or whistles", "Toy whistle")).isTrue();
		assertThat(dropped("No bubbles or whistles", "Blocks")).isFalse();
		assertThat(dropped("No bubbles, whistles and/or drums", "A drum")).isTrue();
		assertThat(dropped("No bubbles and whistles", "Bubbles")).isTrue();
		// The whole list is not one phrase.
		assertThat(dropped("No bubbles or whistles", "bubbles or whistles")).isTrue();
	}

	@Test
	void aSensitivityLosesItsDescriptiveLeadIn() {
		for (String text : List.of("dislikes sticky textures", "Hates sticky textures", "sensitive to sticky textures",
				"Sensitivity to sticky textures", "afraid of sticky textures", "scared of sticky textures",
				"allergic to sticky textures", "intolerant of sticky textures", "avoids sticky textures")) {
			rules.clear();
			rules.add(new Rule(Source.SENSITIVITY, UUID.randomUUID(), List.of(text), List.of()));
			assertThat(check(new DefaultGuardrail(lookup, (ScopeClassifier) null),
					item(Origin.CURATED, "sticky texture play")).outcome()).as(text).isEqualTo(Outcome.DROP);
		}
		// A Restriction is not stripped of a descriptive lead-in.
		assertThat(dropped("dislikes sticky textures", "sticky texture play")).isFalse();
	}

	@Test
	void singularAndPluralAgree() {
		assertThat(dropped("No cookies", "A cookie")).isTrue();
		assertThat(dropped("No cookie", "Two cookies")).isTrue();
		assertThat(dropped("No stories", "A story")).isTrue();
		assertThat(dropped("No story", "Stories")).isTrue();
		assertThat(dropped("No textures", "texture")).isTrue();
		assertThat(dropped("No texture", "textures")).isTrue();
		assertThat(dropped("No boxes", "a box")).isTrue();
		assertThat(dropped("No box", "boxes")).isTrue();
		assertThat(dropped("No pies", "pie")).isTrue();
	}

	@Test
	void aShortFormIsKeptUnlessTheRestrictionHasTheAvoidTerm() {
		restriction("No hand-over-hand prompting");
		assertThat(check(new DefaultGuardrail(lookup, (ScopeClassifier) null), item(Origin.CURATED, "hand-over-hand"))
			.outcome()).isEqualTo(Outcome.KEEP);
		rules.clear();
		restriction("No hand-over-hand prompting", "hand over hand");
		assertThat(check(new DefaultGuardrail(lookup, (ScopeClassifier) null), item(Origin.CURATED, "hand-over-hand"))
			.outcome()).isEqualTo(Outcome.DROP);
	}

	@Test
	void avoidTermsAreUsedAsGivenNotSplit() {
		restriction("Keep it dry", "bubbles or whistles");
		DefaultGuardrail g = new DefaultGuardrail(lookup, (ScopeClassifier) null);
		assertThat(check(g, item(Origin.CURATED, "Blow bubbles")).outcome()).isEqualTo(Outcome.KEEP);
		assertThat(check(g, item(Origin.CURATED, "bubbles or whistles")).outcome()).isEqualTo(Outcome.DROP);
	}

	@Test
	void aRuleWithTwoWordingsMatchesTheNewOneToo() {
		rules.add(new Rule(Source.RESTRICTION, UUID.randomUUID(), List.of("No bubbles", "No whistles"), List.of()));
		assertThat(check(new DefaultGuardrail(lookup, (ScopeClassifier) null), item(Origin.CURATED, "Blow whistles"))
			.outcome()).isEqualTo(Outcome.DROP);
	}

	@Test
	void aNullListOrNullElementsNeverThrow() {
		restriction("No bubbles");
		DefaultGuardrail g = new DefaultGuardrail(lookup, (ScopeClassifier) null);
		assertThat(g.check(null, GuardrailScope.family())).isEmpty();
		List<GuardrailItem> withNull = new ArrayList<>();
		withNull.add(null);
		withNull.add(item(Origin.CURATED, "bubbles"));
		withNull.add(null);
		assertThat(g.check(withNull, GuardrailScope.family())).hasSize(1);
		assertThat(g.allowed(null, null)).isEmpty();
	}

	@Test
	void anAvoidTermMatchesAnywhereInTheItem() {
		restriction("Keep it dry", "sticky", "wet sand");
		DefaultGuardrail g = new DefaultGuardrail(lookup, (ScopeClassifier) null);
		assertThat(check(g, item(Origin.CURATED, "Sticky dough")).outcome()).isEqualTo(Outcome.DROP);
		assertThat(check(g, item(Origin.CURATED, "Play in wet sand")).outcome()).isEqualTo(Outcome.DROP);
		assertThat(check(g, item(Origin.CURATED, "Dry sand")).outcome()).isEqualTo(Outcome.KEEP);
	}

	@Test
	void aSensitivityRuleMatchesLikeARestriction() {
		rules.add(new Rule(Source.SENSITIVITY, UUID.randomUUID(), List.of("sticky textures"), List.of()));
		assertThat(check(new DefaultGuardrail(lookup, (ScopeClassifier) null), item(Origin.AI_SUGGESTED, "a sticky texture"))
			.outcome()).isEqualTo(Outcome.DROP);
	}

	@Test
	void aPrescribedItemIsNeverDroppedForAMatch() {
		restriction("No hand-over-hand prompting");
		GuardrailDecision d = check(new DefaultGuardrail(lookup, (ScopeClassifier) null),
				item(Origin.PRESCRIBED, "hand over hand prompting"));
		assertThat(d.outcome()).isEqualTo(Outcome.KEEP);
		assertThat(d.flags()).containsExactly(Flag.RESTRICTION_CONFLICT);
		assertThat(Flag.RESTRICTION_CONFLICT.code()).isEqualTo("restriction-conflict");
	}

	@Test
	void anUnmatchedCuratedOrPrescribedItemIsKeptWithoutFlags() {
		restriction("No bubbles");
		DefaultGuardrail g = new DefaultGuardrail(lookup, (ScopeClassifier) null);
		assertThat(check(g, item(Origin.CURATED, "blocks"))).extracting(GuardrailDecision::outcome, GuardrailDecision::flags)
			.containsExactly(Outcome.KEEP, List.of());
		assertThat(check(g, item(Origin.PRESCRIBED, "blocks"))).extracting(GuardrailDecision::outcome, GuardrailDecision::flags)
			.containsExactly(Outcome.KEEP, List.of());
	}

	@Test
	void withTheDefaultClassifierAnAiItemIsDroppedEvenWithNoMatch() {
		assertThat(check(new DefaultGuardrail(lookup, (ScopeClassifier) null), item(Origin.AI_SUGGESTED, "blocks"))
			.outcome()).isEqualTo(Outcome.DROP);
	}

	@Test
	void aClassifierThatSaysCheckWithYourTherapistAddsTheFlag() {
		DefaultGuardrail g = new DefaultGuardrail(lookup, i -> Answer.CHECK_WITH_THERAPIST);
		GuardrailDecision d = check(g, item(Origin.AI_SUGGESTED, "blocks"));
		assertThat(d.outcome()).isEqualTo(Outcome.KEEP);
		assertThat(d.flags()).containsExactly(Flag.CHECK_WITH_THERAPIST);
	}

	@Test
	void aClassifierThatClearsKeepsAnAiItemButAMatchStillDropsIt() {
		restriction("No bubbles");
		DefaultGuardrail g = new DefaultGuardrail(lookup, i -> Answer.CLEAR);
		assertThat(check(g, item(Origin.AI_SUGGESTED, "blocks")).outcome()).isEqualTo(Outcome.KEEP);
		assertThat(check(g, item(Origin.AI_SUGGESTED, "bubbles")).outcome()).isEqualTo(Outcome.DROP);
	}

	@Test
	void aClassifierThatThrowsFailsClosed() {
		DefaultGuardrail g = new DefaultGuardrail(lookup, i -> {
			throw new IllegalStateException("model down");
		});
		assertThat(check(g, item(Origin.AI_SUGGESTED, "blocks")).outcome()).isEqualTo(Outcome.DROP);
		assertThat(check(g, item(Origin.CURATED, "blocks")).outcome()).isEqualTo(Outcome.DROP);
		GuardrailDecision prescribed = check(g, item(Origin.PRESCRIBED, "blocks"));
		assertThat(prescribed.outcome()).isEqualTo(Outcome.KEEP);
		assertThat(prescribed.flags()).containsExactly(Flag.CHECK_UNAVAILABLE);
	}

	@Test
	void aLookupThatThrowsFailsClosedForEveryItem() {
		lookupThrows = true;
		DefaultGuardrail g = new DefaultGuardrail(lookup, (ScopeClassifier) null);
		List<GuardrailDecision> decisions = g.check(List.of(item(Origin.AI_SUGGESTED, "a"), item(Origin.CURATED, "b"),
				item(Origin.PRESCRIBED, "c")), GuardrailScope.family());
		assertThat(decisions).extracting(GuardrailDecision::outcome)
			.containsExactly(Outcome.DROP, Outcome.DROP, Outcome.KEEP);
		assertThat(decisions.get(2).flags()).containsExactly(Flag.CHECK_UNAVAILABLE);
	}

	@Test
	void aNullLookupResultFailsClosed() {
		DefaultGuardrail g = new DefaultGuardrail(goalId -> null, (ScopeClassifier) null);
		assertThat(check(g, item(Origin.CURATED, "blocks")).outcome()).isEqualTo(Outcome.DROP);
	}

	@Test
	void decisionsComeBackInTheOrderGiven() {
		restriction("No bubbles");
		DefaultGuardrail g = new DefaultGuardrail(lookup, (ScopeClassifier) null);
		List<GuardrailItem> items = List.of(item(Origin.CURATED, "a"), item(Origin.CURATED, "bubbles"),
				item(Origin.PRESCRIBED, "bubbles"));
		List<GuardrailDecision> decisions = g.check(items, null);
		assertThat(decisions).extracting(GuardrailDecision::item).containsExactlyElementsOf(items);
		assertThat(g.allowed(items, GuardrailScope.family())).hasSize(2);
	}

	@Test
	void theSameItemsTwiceUseTheCacheAndANewVersionRecomputes() {
		restriction("No bubbles");
		DefaultGuardrail g = new DefaultGuardrail(lookup, (ScopeClassifier) null);
		List<GuardrailItem> items = List.of(item(Origin.CURATED, "bubbles"), item(Origin.CURATED, "blocks"));
		g.check(items, GuardrailScope.family());
		assertThat(g.matchComputations()).isEqualTo(2);
		assertThat(g.cacheHits()).isZero();

		g.check(items, GuardrailScope.family());
		assertThat(g.matchComputations()).isEqualTo(2);
		assertThat(g.cacheHits()).isEqualTo(2);

		// The set changes: a new version, so the cached answers are not used.
		rules.clear();
		version = "v2";
		List<GuardrailDecision> after = g.check(items, GuardrailScope.family());
		assertThat(g.matchComputations()).isEqualTo(4);
		assertThat(after.get(0).outcome()).isEqualTo(Outcome.KEEP);
	}

	@Test
	void theCacheIsPerGoalScope() {
		restriction("No bubbles");
		DefaultGuardrail g = new DefaultGuardrail(lookup, (ScopeClassifier) null);
		List<GuardrailItem> items = List.of(item(Origin.CURATED, "blocks"));
		g.check(items, GuardrailScope.family());
		g.check(items, GuardrailScope.goal(UUID.randomUUID()));
		assertThat(g.matchComputations()).isEqualTo(2);
	}

	@Test
	void anUnavailableLookupNeverReusesAnOldAnswerAndClassifierAnswersAreNotCached() {
		AtomicInteger asked = new AtomicInteger();
		DefaultGuardrail g = new DefaultGuardrail(lookup, i -> {
			asked.incrementAndGet();
			return Answer.CLEAR;
		});
		GuardrailItem blocks = item(Origin.CURATED, "blocks");
		g.check(List.of(blocks), GuardrailScope.family());
		g.check(List.of(blocks), GuardrailScope.family());
		assertThat(asked.get()).isEqualTo(2);
		lookupThrows = true;
		assertThat(check(g, blocks).outcome()).isEqualTo(Outcome.DROP);
	}

}
