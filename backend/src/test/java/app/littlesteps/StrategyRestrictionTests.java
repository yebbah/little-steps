package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.sql.DataSource;

import app.littlesteps.ai.api.Guardrail;
import app.littlesteps.ai.api.GuardrailDecision;
import app.littlesteps.ai.api.GuardrailDecision.Flag;
import app.littlesteps.ai.api.GuardrailDecision.Outcome;
import app.littlesteps.ai.api.GuardrailItem;
import app.littlesteps.ai.api.GuardrailItem.Kind;
import app.littlesteps.ai.api.GuardrailItem.Origin;
import app.littlesteps.ai.api.GuardrailScope;
import app.littlesteps.ai.api.RestrictionLookup;
import app.littlesteps.shared.persistence.TenantContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpMethod;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.client.RestTestClient;

/** Story 25.4: Strategy and Restriction tables and reads, the Restriction lookup, and the Guardrail on real data. */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT, properties = "littlesteps.demo.enabled=true")
@AutoConfigureRestTestClient
class StrategyRestrictionTests extends IntegrationTest {

	private static final ParameterizedTypeReference<List<Map<String, Object>>> LIST = new ParameterizedTypeReference<>() {
	};

	private static final UUID A = DemoIdentityTests.FAMILY_A;

	private static final UUID B = DemoIdentityTests.FAMILY_B;

	private static final List<String> PATHS = List.of("/api/v1/strategies", "/api/v1/restrictions");

	@Autowired
	private RestTestClient client;

	@Autowired
	private DataSource dataSource;

	@Autowired
	private RestrictionLookup lookup;

	@Autowired
	private Guardrail guardrail;

	private JdbcTemplate jdbc;

	private DemoFixtures fixtures;

	private UUID memberA;

	private UUID memberB;

	private UUID periodA;

	private UUID goalA;

	private UUID goalA2;

	private UUID goalB;

	private UUID profileA;

	@BeforeEach
	void seed() {
		jdbc = new JdbcTemplate(dataSource);
		fixtures = new DemoFixtures(jdbc);
		fixtures.reset();
		fixtures.family(A);
		fixtures.family(B);
		fixtures.caregiver(DemoIdentityTests.ANNA, "demo-anna", "Anna", 1);
		fixtures.caregiver(DemoIdentityTests.BEN, "demo-ben", "Ben", 2);
		fixtures.member(DemoIdentityTests.ANNA, A);
		fixtures.member(DemoIdentityTests.BEN, B);
		profileA = fixtures.childProfile(A, "Sparrow");
		memberA = fixtures.careTeamMember(A, "Therapist A", "clinic", 1);
		periodA = fixtures.goalPeriod(A, memberA, "2026-09-01", "current");
		goalA = fixtures.prescribedGoal(A, periodA, memberA, "narrative", null, null, null, null, 1);
		goalA2 = fixtures.prescribedGoal(A, periodA, memberA, "narrative", null, null, null, null, 2);
		memberB = fixtures.careTeamMember(B, "Therapist B", "online", 1);
		UUID periodB = fixtures.goalPeriod(B, memberB, "2026-02-01", "current");
		goalB = fixtures.prescribedGoal(B, periodB, memberB, "narrative", null, null, null, null, 1);
	}

	private static GuardrailItem item(Origin origin, String text) {
		return new GuardrailItem(UUID.randomUUID(), Kind.ACTIVITY, origin, text);
	}

	private <T> T inFamily(UUID family, java.util.function.Supplier<T> action) {
		try (var scope = TenantContext.open(family)) {
			return action.get();
		}
	}

	private String version(UUID family) {
		return inFamily(family, () -> lookup.lookup(null).version());
	}

	private GuardrailDecision check(UUID family, GuardrailItem item, GuardrailScope scope) {
		return inFamily(family, () -> guardrail.check(List.of(item), scope).get(0));
	}

	private List<Map<String, Object>> get(UUID caregiver, String path) {
		return client.get()
			.uri(path)
			.header("X-Demo-Caregiver", caregiver.toString())
			.exchange()
			.expectStatus()
			.isOk()
			.expectBody(LIST)
			.returnResult()
			.getResponseBody();
	}

	private void refused(Runnable insert) {
		assertThatThrownBy(insert::run).isInstanceOf(DataIntegrityViolationException.class);
	}

	// ----- read endpoints

	@Test
	void strategiesAreOrderedAndShowTheirSourceAndRetiredFlag() {
		fixtures.strategy(A, goalA, memberA, "second", false, 2);
		fixtures.strategy(A, goalA, memberA, "first", true, 1);
		jdbc.update("update strategy set caregiver_text = 'my words' where original_text = 'second'");
		List<Map<String, Object>> list = get(DemoIdentityTests.ANNA, "/api/v1/strategies");
		assertThat(list).extracting(s -> s.get("originalText")).containsExactly("first", "second");
		assertThat(list).extracting(s -> s.get("retired")).containsExactly(true, false);
		assertThat(list.get(1)).containsEntry("caregiverText", "my words")
			.containsEntry("origin", "prescribed")
			.containsEntry("sourceKind", "care_team_member")
			.containsEntry("sourceId", memberA.toString())
			.containsEntry("goalId", goalA.toString());
		assertThat(list.get(0)).containsEntry("caregiverText", null);
	}

	@Test
	@SuppressWarnings("unchecked")
	void restrictionsCarryTheirAvoidTermsAndAFamilyLevelOneHasNoGoal() {
		UUID goalLevel = fixtures.restriction(A, goalA, memberA, "No flashcards", false, 1);
		fixtures.avoidTerm(A, goalLevel, 2, "cards");
		fixtures.avoidTerm(A, goalLevel, 1, "drill");
		fixtures.restriction(A, null, memberA, "No timers", true, 2);
		List<Map<String, Object>> list = get(DemoIdentityTests.ANNA, "/api/v1/restrictions");
		assertThat(list).extracting(r -> r.get("originalText")).containsExactly("No flashcards", "No timers");
		assertThat((List<String>) list.get(0).get("avoidTerms")).containsExactly("drill", "cards");
		assertThat(list.get(0)).containsEntry("goalId", goalA.toString()).containsEntry("retired", false);
		assertThat(list.get(1)).containsEntry("goalId", null).containsEntry("retired", true);
		assertThat((List<String>) list.get(1).get("avoidTerms")).isEmpty();
	}

	@Test
	void eachFamilyReadsOnlyItsOwnStrategiesAndRestrictions() {
		fixtures.strategy(A, goalA, memberA, "a-strategy", false, 1);
		fixtures.strategy(B, goalB, memberB, "b-strategy", false, 1);
		UUID rb = fixtures.restriction(B, null, memberB, "b-restriction", false, 1);
		fixtures.avoidTerm(B, rb, 1, "b-term");
		fixtures.restriction(A, null, memberA, "a-restriction", false, 1);
		assertThat(get(DemoIdentityTests.ANNA, "/api/v1/strategies")).extracting(s -> s.get("originalText"))
			.containsExactly("a-strategy");
		assertThat(get(DemoIdentityTests.BEN, "/api/v1/strategies")).extracting(s -> s.get("originalText"))
			.containsExactly("b-strategy");
		assertThat(get(DemoIdentityTests.ANNA, "/api/v1/restrictions")).extracting(s -> s.get("originalText"))
			.containsExactly("a-restriction");
		List<Map<String, Object>> bens = get(DemoIdentityTests.BEN, "/api/v1/restrictions");
		assertThat(bens).extracting(s -> s.get("originalText")).containsExactly("b-restriction");
		assertThat(bens.get(0).get("avoidTerms")).isEqualTo(List.of("b-term"));
	}

	@Test
	void writeMethodsAreRefusedWithA405Problem() {
		for (String path : PATHS) {
			for (HttpMethod method : List.of(HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE)) {
				client.method(method)
					.uri(path)
					.header("X-Demo-Caregiver", DemoIdentityTests.ANNA.toString())
					.exchange()
					.expectStatus()
					.isEqualTo(405)
					.expectBody()
					.jsonPath("$.type")
					.isEqualTo("urn:littlesteps:problem:method-not-allowed");
			}
		}
	}

	@Test
	void withAnUnknownCaregiverBothEndpointsAre401() {
		for (String path : PATHS) {
			client.get().uri(path).header("X-Demo-Caregiver", UUID.randomUUID().toString()).exchange()
				.expectStatus().isUnauthorized();
		}
	}

	// ----- database rules

	@Test
	void textMustNotBeBlankAndOriginMustAgreeWithTheSource() {
		for (String table : List.of("strategy", "restriction")) {
			Map<String, Object> goal = Map.of("goal_id", goalA);
			refused(() -> fixtures.rowRaw(table, A, memberA, merge(goal, Map.of("original_text", "  "))));
			refused(() -> fixtures.rowRaw(table, A, memberA, merge(goal, Map.of("caregiver_text", " "))));
			refused(() -> fixtures.rowRaw(table, A, memberA, merge(goal, Map.of("origin", "parent_proposed"))));
			refused(() -> fixtures.rowRaw(table, A, DemoIdentityTests.ANNA,
					merge(goal, Map.of("origin", "prescribed", "source_kind", "caregiver"))));
			refused(() -> fixtures.rowRaw(table, A, memberA, merge(goal, Map.of("source_kind", "somebody"))));
			fixtures.rowRaw(table, A, DemoIdentityTests.ANNA,
					merge(goal, Map.of("origin", "parent_proposed", "source_kind", "caregiver")));
		}
	}

	private static Map<String, Object> merge(Map<String, Object> a, Map<String, Object> b) {
		Map<String, Object> m = new java.util.HashMap<>(a);
		m.putAll(b);
		return m;
	}

	@Test
	void aStrategyNeedsAGoalButARestrictionDoesNot() {
		refused(() -> fixtures.rowRaw("strategy", A, memberA, Map.of()));
		fixtures.rowRaw("restriction", A, memberA, Map.of());
	}

	@Test
	void aRowCannotNameAnotherFamilysGoalOrRestriction() {
		refused(() -> fixtures.rowRaw("strategy", A, memberA, Map.of("goal_id", goalB)));
		refused(() -> fixtures.rowRaw("restriction", A, memberA, Map.of("goal_id", goalB)));
		UUID rb = fixtures.restriction(B, null, memberB, "b", false, 1);
		refused(() -> fixtures.avoidTerm(A, rb, 1, "x"));
	}

	@Test
	void aGoalWithAStrategyOrRestrictionCannotBeDeleted() {
		fixtures.strategy(A, goalA, memberA, "s", false, 1);
		fixtures.restriction(A, goalA2, memberA, "r", false, 1);
		refused(() -> jdbc.update("delete from goal where id = ?", goalA));
		refused(() -> jdbc.update("delete from goal where id = ?", goalA2));
	}

	@Test
	void originalTextIsWriteOnceButCaregiverTextAndRetirementCanChange() {
		fixtures.strategy(A, goalA, memberA, "s", false, 1);
		fixtures.restriction(A, null, memberA, "r", false, 1);
		for (String table : List.of("strategy", "restriction")) {
			assertThat(jdbc.update("update " + table + " set caregiver_text = 'mine', retired_at = now()")).isEqualTo(1);
			assertThatThrownBy(() -> jdbc.update("update " + table + " set original_text = 'changed'"))
				.isInstanceOf(DataIntegrityViolationException.class);
		}
		assertThat(jdbc.queryForObject("select original_text from restriction", String.class)).isEqualTo("r");
	}

	@Test
	void avoidTermsAreNotBlankOrderedUniquelyAndGoWithTheirRestriction() {
		UUID r = fixtures.restriction(A, null, memberA, "r", false, 1);
		fixtures.avoidTerm(A, r, 1, "sticky");
		refused(() -> fixtures.avoidTerm(A, r, 1, "other"));
		refused(() -> fixtures.avoidTerm(A, r, 2, "  "));
		jdbc.update("delete from restriction where id = ?", r);
		assertThat(jdbc.queryForObject("select count(*) from restriction_avoid_term", Integer.class)).isZero();
	}

	@Test
	void deletingTheFamilyRemovesItsStrategiesAndRestrictions() {
		fixtures.strategy(A, goalA, memberA, "s", false, 1);
		UUID r = fixtures.restriction(A, goalA, memberA, "r", false, 1);
		fixtures.avoidTerm(A, r, 1, "t");
		fixtures.restriction(B, null, memberB, "keep", false, 1);
		jdbc.update("delete from families where id = ?", A);
		for (String table : List.of("strategy", "restriction", "restriction_avoid_term")) {
			assertThat(jdbc.queryForObject("select count(*) from " + table + " where family_id = ?", Integer.class, A))
				.as(table)
				.isZero();
		}
		assertThat(jdbc.queryForObject("select count(*) from restriction where family_id = ?", Integer.class, B))
			.isEqualTo(1);
	}

	// ----- the lookup and its version

	@Test
	void theLookupReturnsTheGoalAndFamilyRestrictionsAndAvoidSensitivitiesButNotRetiredOnes() {
		UUID goalRestriction = fixtures.restriction(A, goalA, memberA, "No flashcards", false, 1);
		fixtures.avoidTerm(A, goalRestriction, 1, "drill");
		fixtures.restriction(A, goalA2, memberA, "No timers", false, 2);
		fixtures.restriction(A, null, memberA, "No bubbles", false, 3);
		fixtures.restriction(A, null, memberA, "No whistles", true, 4);
		fixtures.sensitivity(A, profileA, 1, "sticky textures", true);
		fixtures.sensitivity(A, profileA, 2, "bright lights", false);

		RestrictionLookup.RestrictionSet forGoal = inFamily(A, () -> lookup.lookup(goalA));
		assertThat(forGoal.familyId()).isEqualTo(A);
		assertThat(forGoal.rules()).extracting(r -> r.texts().get(0))
			.containsExactly("No flashcards", "No bubbles", "sticky textures");
		assertThat(forGoal.rules().get(0).avoidTerms()).containsExactly("drill");
		assertThat(forGoal.rules()).extracting(RestrictionLookup.Rule::source)
			.containsExactly(RestrictionLookup.Source.RESTRICTION, RestrictionLookup.Source.RESTRICTION,
					RestrictionLookup.Source.SENSITIVITY);

		RestrictionLookup.RestrictionSet familyOnly = inFamily(A, () -> lookup.lookup(null));
		assertThat(familyOnly.rules()).extracting(r -> r.texts().get(0)).containsExactly("No bubbles", "sticky textures");
		assertThat(familyOnly.version()).isEqualTo(forGoal.version());
	}

	@Test
	void aCaregiverEditIsAlsoATargetSoAnEditCannotHideAConflict() {
		UUID r = fixtures.restriction(A, null, memberA, "No bubbles", false, 1);
		jdbc.update("update restriction set caregiver_text = 'No whistles' where id = ?", r);
		RestrictionLookup.Rule rule = inFamily(A, () -> lookup.lookup(null)).rules().get(0);
		assertThat(rule.texts()).containsExactly("No bubbles", "No whistles");
	}

	@Test
	void theVersionIsStableUntilARestrictionTermRetirementOrSensitivityChanges() {
		String start = version(A);
		assertThat(version(A)).isEqualTo(start);
		assertThat(start).hasSize(64);

		UUID r = fixtures.restriction(A, null, memberA, "No bubbles", false, 1);
		String added = version(A);
		assertThat(added).isNotEqualTo(start);
		assertThat(version(A)).isEqualTo(added);

		fixtures.avoidTerm(A, r, 1, "soap");
		String termAdded = version(A);
		assertThat(termAdded).isNotEqualTo(added);

		jdbc.update("update restriction set caregiver_text = 'No bubbles please' where id = ?", r);
		String edited = version(A);
		assertThat(edited).isNotEqualTo(termAdded);

		UUID s = fixtures.sensitivity(A, profileA, 1, "loud noises", true);
		String sensitivityAdded = version(A);
		assertThat(sensitivityAdded).isNotEqualTo(edited);

		jdbc.update("update child_sensitivity set text = 'loud sounds' where id = ?", s);
		String sensitivityEdited = version(A);
		assertThat(sensitivityEdited).isNotEqualTo(sensitivityAdded);

		jdbc.update("update child_sensitivity set avoid = false where id = ?", s);
		String sensitivityOff = version(A);
		assertThat(sensitivityOff).isEqualTo(edited);

		jdbc.update("update restriction set retired_at = now() where id = ?", r);
		assertThat(version(A)).isEqualTo(start);
	}

	@Test
	void aChangeInOneFamilyDoesNotChangeTheOthersVersionOrRules() {
		String b = version(B);
		fixtures.restriction(A, null, memberA, "No bubbles", false, 1);
		assertThat(version(B)).isEqualTo(b);
		assertThat(inFamily(B, () -> lookup.lookup(null)).rules()).isEmpty();
	}

	@Test
	void withNoTenantTheLookupRefusesInsteadOfReadingAnotherFamily() {
		assertThatThrownBy(() -> lookup.lookup(null)).isInstanceOf(IllegalStateException.class);
	}

	// ----- the Guardrail on real data

	@Test
	void aRestrictionDropsACuratedItemAndKeepsAPrescribedOneFlagged() {
		fixtures.restriction(A, null, memberA, "No hand-over-hand prompting", false, 1);
		GuardrailDecision curated = check(A, item(Origin.CURATED, "Hand over hand prompting at the table"),
				GuardrailScope.family());
		assertThat(curated.outcome()).isEqualTo(Outcome.DROP);
		GuardrailDecision prescribed = check(A, item(Origin.PRESCRIBED, "Hand over hand prompting at the table"),
				GuardrailScope.family());
		assertThat(prescribed.outcome()).isEqualTo(Outcome.KEEP);
		assertThat(prescribed.flags()).containsExactly(Flag.RESTRICTION_CONFLICT);
		assertThat(check(A, item(Origin.CURATED, "Handing out cards"), GuardrailScope.family()).outcome())
			.isEqualTo(Outcome.KEEP);
	}

	@Test
	void anAvoidSensitivityDropsAnItemAndOneNotMarkedAvoidDoesNot() {
		UUID s = fixtures.sensitivity(A, profileA, 1, "sticky textures", true);
		assertThat(check(A, item(Origin.CURATED, "A sticky texture tray"), GuardrailScope.family()).outcome())
			.isEqualTo(Outcome.DROP);
		jdbc.update("update child_sensitivity set avoid = false where id = ?", s);
		assertThat(check(A, item(Origin.CURATED, "A sticky texture tray"), GuardrailScope.family()).outcome())
			.isEqualTo(Outcome.KEEP);
	}

	@Test
	void anAvoidTermDropsAnItem() {
		UUID r = fixtures.restriction(A, null, memberA, "Keep it dry", false, 1);
		fixtures.avoidTerm(A, r, 1, "sticky");
		assertThat(check(A, item(Origin.CURATED, "Sticky dough"), GuardrailScope.family()).outcome())
			.isEqualTo(Outcome.DROP);
	}

	@Test
	void aRetiredRestrictionStopsApplyingAtOnce() {
		UUID r = fixtures.restriction(A, null, memberA, "No bubbles", false, 1);
		GuardrailItem bubbles = item(Origin.CURATED, "Blow bubbles");
		assertThat(check(A, bubbles, GuardrailScope.family()).outcome()).isEqualTo(Outcome.DROP);
		jdbc.update("update restriction set retired_at = now() where id = ?", r);
		assertThat(check(A, bubbles, GuardrailScope.family()).outcome()).isEqualTo(Outcome.KEEP);
		jdbc.update("update restriction set retired_at = null where id = ?", r);
		assertThat(check(A, bubbles, GuardrailScope.family()).outcome()).isEqualTo(Outcome.DROP);
	}

	@Test
	void aGoalLevelRestrictionAppliesToItsGoalOnlyAndAFamilyLevelOneEverywhere() {
		fixtures.restriction(A, goalA, memberA, "No flashcards", false, 1);
		fixtures.restriction(A, null, memberA, "No timers", false, 2);
		GuardrailItem flashcards = item(Origin.CURATED, "Flashcards of animals");
		GuardrailItem timer = item(Origin.CURATED, "A timer game");
		assertThat(check(A, flashcards, GuardrailScope.goal(goalA)).outcome()).isEqualTo(Outcome.DROP);
		assertThat(check(A, flashcards, GuardrailScope.goal(goalA2)).outcome()).isEqualTo(Outcome.KEEP);
		assertThat(check(A, flashcards, GuardrailScope.family()).outcome()).isEqualTo(Outcome.KEEP);
		assertThat(check(A, timer, GuardrailScope.goal(goalA2)).outcome()).isEqualTo(Outcome.DROP);
		assertThat(check(A, timer, GuardrailScope.family()).outcome()).isEqualTo(Outcome.DROP);
	}

	@Test
	void anotherFamilysRestrictionNeverApplies() {
		fixtures.restriction(B, null, memberB, "No bubbles", false, 1);
		fixtures.sensitivity(B, fixtures.childProfile(B, "Finch"), 1, "loud noises", true);
		assertThat(check(A, item(Origin.CURATED, "Blow bubbles near loud noises"), GuardrailScope.family()).outcome())
			.isEqualTo(Outcome.KEEP);
		assertThat(check(B, item(Origin.CURATED, "Blow bubbles"), GuardrailScope.family()).outcome())
			.isEqualTo(Outcome.DROP);
	}

	@Test
	void anAiItemIsDroppedUntilAClassifierExistsAndWithNoTenantEverythingFailsClosed() {
		assertThat(check(A, item(Origin.AI_SUGGESTED, "Blocks"), GuardrailScope.family()).outcome())
			.isEqualTo(Outcome.DROP);
		// No tenant: the lookup refuses, so a curated item is dropped and a prescribed one is flagged.
		List<GuardrailDecision> none = guardrail.check(List.of(item(Origin.CURATED, "Blocks"),
				item(Origin.PRESCRIBED, "Blocks")), GuardrailScope.family());
		assertThat(none).extracting(GuardrailDecision::outcome).containsExactly(Outcome.DROP, Outcome.KEEP);
		assertThat(none.get(1).flags()).containsExactly(Flag.CHECK_UNAVAILABLE);
	}


	@Autowired
	private org.springframework.transaction.support.TransactionTemplate tx;

	@Test
	void aGoalThatIsNotTheFamilysMakesTheCheckUnavailable() {
		GuardrailScope other = GuardrailScope.goal(goalB);
		assertThatThrownBy(() -> inFamily(A, () -> lookup.lookup(goalB))).isInstanceOf(IllegalArgumentException.class);
		assertThat(check(A, item(Origin.CURATED, "Blocks"), other).outcome()).isEqualTo(Outcome.DROP);
		assertThat(check(A, item(Origin.AI_SUGGESTED, "Blocks"), other).outcome()).isEqualTo(Outcome.DROP);
		GuardrailDecision prescribed = check(A, item(Origin.PRESCRIBED, "Blocks"), other);
		assertThat(prescribed.outcome()).isEqualTo(Outcome.KEEP);
		assertThat(prescribed.flags()).containsExactly(Flag.CHECK_UNAVAILABLE);
		GuardrailScope unknown = GuardrailScope.goal(UUID.randomUUID());
		assertThat(check(A, item(Origin.CURATED, "Blocks"), unknown).outcome()).isEqualTo(Outcome.DROP);
		// A Goal of the Family still works.
		assertThat(check(A, item(Origin.CURATED, "Blocks"), GuardrailScope.goal(goalA)).outcome())
			.isEqualTo(Outcome.KEEP);
	}

	@Test
	void aFailedLookupInsideATransactionDoesNotRollItBack() {
		fixtures.restriction(A, null, memberA, "No bubbles", false, 1);
		// No tenant is open, so the lookup fails; the caller's transaction must still commit.
		List<GuardrailDecision> decisions = tx.execute(status -> {
			jdbc.update("update families set timezone = 'Europe/Paris' where id = ?", A);
			return guardrail.check(List.of(item(Origin.CURATED, "Blocks")), GuardrailScope.family());
		});
		assertThat(decisions).extracting(GuardrailDecision::outcome).containsExactly(Outcome.DROP);
		// An unknown Goal fails inside the lookup's own transaction scope too.
		tx.executeWithoutResult(status -> inFamily(A, () -> guardrail.check(List.of(item(Origin.CURATED, "Blocks")),
				GuardrailScope.goal(goalB))));
	}

	@Test
	void aCaregiverEditRewordsARestrictionAndTheNewWordingAlsoMatches() {
		UUID r = fixtures.restriction(A, null, memberA, "No bubbles", false, 1);
		GuardrailItem whistles = item(Origin.CURATED, "Blow whistles");
		assertThat(check(A, whistles, GuardrailScope.family()).outcome()).isEqualTo(Outcome.KEEP);
		jdbc.update("update restriction set caregiver_text = 'No whistles' where id = ?", r);
		assertThat(check(A, whistles, GuardrailScope.family()).outcome()).isEqualTo(Outcome.DROP);
		// The Care Team's own wording still applies.
		assertThat(check(A, item(Origin.CURATED, "Blow bubbles"), GuardrailScope.family()).outcome())
			.isEqualTo(Outcome.DROP);
	}

	@Test
	void aShortFormIsKeptUnlessTheRestrictionHasTheAvoidTerm() {
		UUID r = fixtures.restriction(A, null, memberA, "No hand-over-hand prompting", false, 1);
		GuardrailItem item = item(Origin.CURATED, "hand-over-hand");
		assertThat(check(A, item, GuardrailScope.family()).outcome()).isEqualTo(Outcome.KEEP);
		fixtures.avoidTerm(A, r, 1, "hand over hand");
		assertThat(check(A, item, GuardrailScope.family()).outcome()).isEqualTo(Outcome.DROP);
	}

	@Test
	void listsLeadInVerbsAndDescriptiveSensitivitiesWorkOnRealData() {
		fixtures.restriction(A, null, memberA, "Don't use flashcards", false, 1);
		fixtures.restriction(A, null, memberA, "No bubbles or whistles", false, 2);
		fixtures.sensitivity(A, profileA, 1, "dislikes sticky textures", true);
		for (String text : List.of("Flashcards of animals", "Blowing bubbles", "Toy whistle", "sticky texture play")) {
			assertThat(check(A, item(Origin.CURATED, text), GuardrailScope.family()).outcome()).as(text)
				.isEqualTo(Outcome.DROP);
		}
		assertThat(check(A, item(Origin.CURATED, "Blocks"), GuardrailScope.family()).outcome()).isEqualTo(Outcome.KEEP);
	}

}
