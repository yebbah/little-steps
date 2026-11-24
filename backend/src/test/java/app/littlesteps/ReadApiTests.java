package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.sql.DataSource;

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

/** Story 25.3: the read endpoints, the database checks, and two-Family isolation for every endpoint. */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT, properties = "littlesteps.demo.enabled=true")
@AutoConfigureRestTestClient
class ReadApiTests extends IntegrationTest {

	private static final ParameterizedTypeReference<List<Map<String, Object>>> LIST = new ParameterizedTypeReference<>() {
	};

	private static final ParameterizedTypeReference<Map<String, Object>> MAP = new ParameterizedTypeReference<>() {
	};

	private static final UUID A = DemoIdentityTests.FAMILY_A;

	private static final UUID B = DemoIdentityTests.FAMILY_B;

	private static final List<String> PATHS = List.of("/api/v1/child-profile", "/api/v1/care-team-members",
			"/api/v1/prompt-levels", "/api/v1/goal-periods", "/api/v1/goals");

	@Autowired
	private RestTestClient client;

	@Autowired
	private DataSource dataSource;

	private DemoFixtures fixtures;

	private UUID memberA;

	private UUID memberB;

	private UUID levelA;

	private UUID periodA;

	private UUID profileB;

	private UUID levelB;

	private UUID periodB;

	private UUID goalB;

	@BeforeEach
	void seed() {
		fixtures = new DemoFixtures(new JdbcTemplate(dataSource));
		fixtures.reset();
		fixtures.family(A);
		fixtures.family(B);
		fixtures.caregiver(DemoIdentityTests.ANNA, "demo-anna", "Anna", 1);
		fixtures.caregiver(DemoIdentityTests.BEN, "demo-ben", "Ben", 2);
		fixtures.member(DemoIdentityTests.ANNA, A);
		fixtures.member(DemoIdentityTests.BEN, B);

		UUID profileA = fixtures.childProfile(A, "Sparrow");
		fixtures.sensitivity(A, profileA, 2, "loud noises", true);
		fixtures.sensitivity(A, profileA, 1, "bright lights", false);
		memberA = fixtures.careTeamMember(A, "Therapist A2", "school", 2);
		UUID firstA = fixtures.careTeamMember(A, "Therapist A1", "clinic", 1);
		levelA = fixtures.promptLevel(A, 2, "Gesture", false);
		fixtures.promptLevel(A, 1, "Full help", true);
		fixtures.statusWord(A, memberA, 2, "Practising", false);
		fixtures.statusWord(A, memberA, 1, "Starting", true);
		fixtures.memberPromptLevel(A, memberA, levelA, "Point");
		periodA = fixtures.goalPeriod(A, memberA, "2026-09-01", "current");
		fixtures.goalPeriod(A, firstA, "2026-01-01", "closed");
		fixtures.prescribedGoal(A, periodA, memberA, "structured", "trials", 4, 5, levelA, 1);
		fixtures.prescribedGoal(A, periodA, memberA, "narrative", null, null, null, null, 2);
		fixtures.goal(A, periodA, DemoIdentityTests.ANNA, "parent_proposed", "proposed", memberA, "narrative", null, null,
				null, null, 3);

		profileB = fixtures.childProfile(B, "Finch");
		fixtures.sensitivity(B, profileB, 1, "b-sensitivity", true);
		memberB = fixtures.careTeamMember(B, "Therapist B", "online", 1);
		levelB = fixtures.promptLevel(B, 1, "B level", false);
		fixtures.statusWord(B, memberB, 1, "B word", false);
		periodB = fixtures.goalPeriod(B, memberB, "2026-02-01", "current");
		goalB = fixtures.prescribedGoal(B, periodB, memberB, "structured", "count", 3, null, levelB, 1);
	}

	@Test
	void childProfileHasTheNicknameAndOrderedSensitivities() {
		Map<String, Object> body = get(DemoIdentityTests.ANNA, "/api/v1/child-profile", MAP);
		assertThat(body).containsEntry("nickname", "Sparrow").containsEntry("ageBand", "early years");
		assertThat(body).doesNotContainKeys("name", "dateOfBirth", "familyId");
		assertThat(maps(body.get("sensitivities"))).extracting(s -> s.get("text"))
			.containsExactly("bright lights", "loud noises");
		assertThat(maps(body.get("sensitivities"))).extracting(s -> s.get("avoid")).containsExactly(false, true);
	}

	@Test
	void aFamilyWithoutAProfileGets404() {
		UUID empty = UUID.fromString("0190a000-0000-7000-8000-00000000000c");
		fixtures.family(empty);
		fixtures.caregiver(DemoIdentityTests.CLEO, "demo-cleo", "Cleo", 3);
		fixtures.member(DemoIdentityTests.CLEO, empty);
		client.get()
			.uri("/api/v1/child-profile")
			.header("X-Demo-Caregiver", DemoIdentityTests.CLEO.toString())
			.exchange()
			.expectStatus()
			.isNotFound()
			.expectBody()
			.jsonPath("$.type")
			.isEqualTo("urn:littlesteps:problem:not-found");
	}

	@Test
	void careTeamMembersAreOrderedAndCarryTheirVocabularyAndMapping() {
		List<Map<String, Object>> members = get(DemoIdentityTests.ANNA, "/api/v1/care-team-members", LIST);
		assertThat(members).extracting(m -> m.get("role")).containsExactly("Therapist A1", "Therapist A2");
		Map<String, Object> second = members.get(1);
		assertThat(second).containsEntry("careSetting", "school");
		assertThat(maps(second.get("statusVocabulary"))).extracting(w -> w.get("label"))
			.containsExactly("Starting", "Practising");
		assertThat(maps(second.get("statusVocabulary"))).extracting(w -> w.get("retired")).containsExactly(true, false);
		assertThat(maps(second.get("promptLevelMapping"))).extracting(l -> l.get("label")).containsExactly("Point");
		assertThat(maps(members.get(0).get("statusVocabulary"))).isEmpty();
	}

	@Test
	void aRetiredPromptLevelIsStillListedWithTheFlag() {
		List<Map<String, Object>> levels = get(DemoIdentityTests.ANNA, "/api/v1/prompt-levels", LIST);
		assertThat(levels).extracting(l -> l.get("label")).containsExactly("Full help", "Gesture");
		assertThat(levels).extracting(l -> l.get("retired")).containsExactly(true, false);
	}

	@Test
	void goalPeriodsAreOrderedByStart() {
		List<Map<String, Object>> periods = get(DemoIdentityTests.ANNA, "/api/v1/goal-periods", LIST);
		assertThat(periods).extracting(p -> p.get("startsOn")).containsExactly("2026-01-01", "2026-09-01");
		assertThat(periods).extracting(p -> p.get("status")).containsExactly("closed", "current");
	}

	@Test
	void goalsShowReviewStatusOriginAndCriterion() {
		List<Map<String, Object>> goals = get(DemoIdentityTests.ANNA, "/api/v1/goals", LIST);
		assertThat(goals).hasSize(3);
		Map<String, Object> structured = goals.get(0);
		assertThat(structured).containsEntry("origin", "prescribed")
			.containsEntry("reviewStatus", "confirmed")
			.containsEntry("goalType", "structured")
			.containsEntry("criterionKind", "trials")
			.containsEntry("criterionTarget", 4)
			.containsEntry("criterionOutOf", 5)
			.containsEntry("criterionPromptLevelId", levelA.toString())
			.containsEntry("originalText", "original wording")
			.containsEntry("retired", false);
		Map<String, Object> narrative = goals.get(1);
		assertThat(narrative).containsEntry("goalType", "narrative")
			.containsEntry("criterionKind", null)
			.containsEntry("criterionTarget", null)
			.containsEntry("criterionOutOf", null)
			.containsEntry("criterionPromptLevelId", null);
		Map<String, Object> proposed = goals.get(2);
		assertThat(proposed).containsEntry("origin", "parent_proposed")
			.containsEntry("reviewStatus", "proposed")
			.containsEntry("proposedTo", memberA.toString());
	}

	@Test
	void aRetiredGoalIsListedWithTheFlag() {
		UUID id = fixtures.prescribedGoal(A, periodA, memberA, "narrative", null, null, null, null, 4);
		new JdbcTemplate(dataSource).update("update goal set retired_at = now() where id = ?", id);
		List<Map<String, Object>> goals = get(DemoIdentityTests.ANNA, "/api/v1/goals", LIST);
		assertThat(goals).extracting(g -> g.get("retired")).containsExactly(false, false, false, true);
	}

	@Test
	void eachFamilyReadsOnlyItsOwnRowsOnEveryEndpoint() {
		assertThat(get(DemoIdentityTests.BEN, "/api/v1/child-profile", MAP)).containsEntry("nickname", "Finch");
		assertThat(get(DemoIdentityTests.ANNA, "/api/v1/child-profile", MAP)).containsEntry("nickname", "Sparrow");
		assertThat(get(DemoIdentityTests.BEN, "/api/v1/care-team-members", LIST)).extracting(m -> m.get("role"))
			.containsExactly("Therapist B");
		assertThat(get(DemoIdentityTests.BEN, "/api/v1/prompt-levels", LIST)).extracting(m -> m.get("label"))
			.containsExactly("B level");
		assertThat(get(DemoIdentityTests.BEN, "/api/v1/goal-periods", LIST)).extracting(m -> m.get("careTeamMemberId"))
			.containsExactly(memberB.toString());
		assertThat(get(DemoIdentityTests.BEN, "/api/v1/goals", LIST)).hasSize(1)
			.extracting(m -> m.get("criterionKind"))
			.containsExactly("count");
		assertThat(maps(get(DemoIdentityTests.BEN, "/api/v1/child-profile", MAP).get("sensitivities")))
			.extracting(s -> s.get("text"))
			.containsExactly("b-sensitivity");
		assertThat(get(DemoIdentityTests.ANNA, "/api/v1/care-team-members", LIST)).hasSize(2);
		assertThat(get(DemoIdentityTests.ANNA, "/api/v1/goals", LIST)).hasSize(3);
	}

	@Test
	void withNoDemoHeaderTheDefaultCaregiverStillSeesOnlyTheirFamily() {
		client.get()
			.uri("/api/v1/child-profile")
			.exchange()
			.expectStatus()
			.isOk()
			.expectBody()
			.jsonPath("$.nickname")
			.isEqualTo("Sparrow");
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
	void withNoCaregiverEveryEndpointIs401() {
		for (String path : PATHS) {
			client.get().uri(path).header("X-Demo-Caregiver", UUID.randomUUID().toString()).exchange()
				.expectStatus().isUnauthorized();
		}
	}

	@Test
	void aPrescribedGoalMustBeConfirmed() {
		assertThatThrownBy(() -> fixtures.goal(A, periodA, memberA, "prescribed", "proposed", null, "narrative", null,
				null, null, null, 9)).isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void aParentProposedGoalMustNameWhoItIsProposedTo() {
		assertThatThrownBy(() -> fixtures.goal(A, periodA, DemoIdentityTests.ANNA, "parent_proposed", "proposed", null,
				"narrative", null, null, null, null, 9)).isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void aStructuredGoalNeedsACriterion() {
		assertThatThrownBy(() -> fixtures.prescribedGoal(A, periodA, memberA, "structured", null, null, null, null, 9))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void aNarrativeGoalCannotHaveACriterion() {
		assertThatThrownBy(() -> fixtures.prescribedGoal(A, periodA, memberA, "narrative", "count", 3, null, null, 9))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void outOfIsOnlyForTrials() {
		assertThatThrownBy(() -> fixtures.prescribedGoal(A, periodA, memberA, "structured", "count", 3, 5, null, 9))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void originalTextCannotBeUpdatedButOtherColumnsCan() {
		JdbcTemplate jdbc = new JdbcTemplate(dataSource);
		assertThat(jdbc.update("update goal set caregiver_text = 'my words', description = 'edited' where family_id = ?", A))
			.isEqualTo(3);
		assertThatThrownBy(() -> jdbc.update("update goal set original_text = 'changed' where family_id = ?", A))
			.isInstanceOf(DataIntegrityViolationException.class);
		assertThat(jdbc.queryForList("select distinct original_text from goal where family_id = ?", String.class, A))
			.containsExactly("original wording");
	}

	@Test
	void careSettingAndPeriodStatusAreLimitedToTheirCodes() {
		assertThatThrownBy(() -> fixtures.careTeamMember(A, "x", "elsewhere", 9))
			.isInstanceOf(DataIntegrityViolationException.class);
		assertThatThrownBy(() -> fixtures.goalPeriod(A, memberA, "2026-01-01", "open"))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void aChildProfileHasNoNameOrBirthDateColumn() {
		List<String> columns = new JdbcTemplate(dataSource).queryForList(
				"select column_name from information_schema.columns where table_name = 'child_profile'", String.class);
		assertThat(columns).doesNotContain("name", "real_name", "date_of_birth", "birth_date");
	}

	private <T> T get(UUID caregiver, String path, ParameterizedTypeReference<T> type) {
		return client.get()
			.uri(path)
			.header("X-Demo-Caregiver", caregiver.toString())
			.exchange()
			.expectStatus()
			.isOk()
			.expectBody(type)
			.returnResult()
			.getResponseBody();
	}

	@SuppressWarnings("unchecked")
	private static List<Map<String, Object>> maps(Object o) {
		return (List<Map<String, Object>>) o;
	}

	private UUID aGoal() {
		return new JdbcTemplate(dataSource)
			.queryForObject("select id from goal where family_id = ? and goal_type = 'structured'", UUID.class, A);
	}

	private void refused(Runnable insert) {
		assertThatThrownBy(insert::run).isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void aRowCannotNameAnotherFamilysParent() {
		JdbcTemplate jdbc = new JdbcTemplate(dataSource);
		UUID sensitivityProfile = profileB;
		refused(() -> fixtures.sensitivity(A, sensitivityProfile, 1, "x", false));
		refused(() -> fixtures.statusWord(A, memberB, 1, "x", false));
		refused(() -> fixtures.memberPromptLevel(A, memberB, levelA, "x"));
		refused(() -> fixtures.memberPromptLevel(A, memberA, levelB, "x"));
		refused(() -> fixtures.goalPeriod(A, memberB, "2026-03-01", "closed"));
		refused(() -> fixtures.goalRaw(A, memberA, Map.of("goal_period_id", periodB)));
		refused(() -> fixtures.goalRaw(A, memberA, Map.of("goal_type", "structured", "criterion_kind", "count",
				"criterion_target", 3, "criterion_prompt_level_id", levelB)));
		refused(() -> fixtures.goalRaw(A, DemoIdentityTests.ANNA, Map.of("origin", "parent_proposed", "source_kind",
				"caregiver", "review_status", "proposed", "proposed_to", memberB)));
		refused(() -> fixtures.goalRaw(A, memberA, Map.of("parent_goal_id", goalB)));
		refused(() -> fixtures.goalRaw(A, memberA, Map.of("revised_from", goalB, "lineage", "revised")));
		assertThat(jdbc.queryForObject("select count(*) from goal where family_id = ?", Integer.class, A)).isEqualTo(3);
	}

	@Test
	void aMemberWithAPeriodCannotBeDeleted() {
		refused(() -> new JdbcTemplate(dataSource).update("delete from care_team_member where id = ?", memberA));
	}

	@Test
	void aPeriodWithGoalsCannotBeDeleted() {
		refused(() -> new JdbcTemplate(dataSource).update("delete from goal_period where id = ?", periodA));
	}

	@Test
	void aPromptLevelUsedByAGoalCannotBeDeleted() {
		UUID used = fixtures.promptLevel(A, 7, "Used", false);
		fixtures.prescribedGoal(A, periodA, memberA, "structured", "count", 2, null, used, 8);
		refused(() -> new JdbcTemplate(dataSource).update("delete from prompt_level where id = ?", used));
	}

	@Test
	void aReferencedGoalCannotBeDeleted() {
		UUID parent = aGoal();
		fixtures.goalRaw(A, memberA, Map.of("parent_goal_id", parent));
		refused(() -> new JdbcTemplate(dataSource).update("delete from goal where id = ?", parent));
	}

	@Test
	void deletingTheFamilyRemovesEverything() {
		JdbcTemplate jdbc = new JdbcTemplate(dataSource);
		fixtures.goalRaw(A, memberA, Map.of("parent_goal_id", aGoal()));
		jdbc.update("delete from families where id = ?", A);
		for (String table : List.of("child_profile", "child_sensitivity", "care_team_member", "prompt_level",
				"status_vocabulary_item", "care_team_member_prompt_level", "goal_period", "goal")) {
			assertThat(jdbc.queryForObject("select count(*) from " + table + " where family_id = ?", Integer.class, A))
				.as(table)
				.isZero();
		}
		assertThat(jdbc.queryForObject("select count(*) from goal where family_id = ?", Integer.class, B)).isEqualTo(1);
	}

	@Test
	void goalChecksRefuseBadRows() {
		refused(() -> fixtures.goalRaw(A, memberA, Map.of("origin", "parent_proposed", "review_status", "proposed",
				"proposed_to", memberA)));
		refused(() -> fixtures.goalRaw(A, DemoIdentityTests.ANNA, Map.of("source_kind", "caregiver")));
		UUID self = UUID.randomUUID();
		refused(() -> fixtures.goalRaw(A, memberA, Map.of("id", self, "parent_goal_id", self)));
		UUID self2 = UUID.randomUUID();
		refused(() -> fixtures.goalRaw(A, memberA, Map.of("id", self2, "revised_from", self2)));
		refused(() -> fixtures.goalRaw(A, memberA, Map.of("lineage", "revised")));
		refused(() -> fixtures.goalRaw(A, memberA, Map.of("original_text", "  ")));
	}

	@Test
	void aMemberHasAtMostOneCurrentPeriod() {
		refused(() -> fixtures.goalPeriod(A, memberA, "2026-12-01", "current"));
		fixtures.goalPeriod(A, memberA, "2025-01-01", "closed");
	}

	@Test
	void aPeriodCannotEndBeforeItStarts() {
		refused(() -> new JdbcTemplate(dataSource).update("insert into goal_period (id, family_id, care_team_member_id,"
				+ " starts_on, ends_on, status) values (?, ?, ?, '2026-05-01', '2026-04-01', 'closed')", UUID.randomUUID(),
				A, memberA));
	}

	@Test
	void activePromptLevelOrdinalsAreUniqueButARetiredOneGivesItUp() {
		refused(() -> fixtures.promptLevel(A, 2, "Duplicate", false));
		fixtures.promptLevel(A, 1, "Replaces the retired one", false);
		fixtures.promptLevel(A, 2, "Another retired", true);
	}

	@Test
	void activeStatusVocabularyOrdinalsAreUniqueButARetiredOneGivesItUp() {
		refused(() -> fixtures.statusWord(A, memberA, 2, "Duplicate", false));
		fixtures.statusWord(A, memberA, 1, "Replaces the retired one", false);
	}

	@Test
	void aMemberMapsAPromptLevelOnlyOnce() {
		refused(() -> fixtures.memberPromptLevel(A, memberA, levelA, "Again"));
	}

	@Test
	void criterionNumbersAreChecked() {
		refused(() -> fixtures.prescribedGoal(A, periodA, memberA, "structured", "count", 0, null, null, 9));
		refused(() -> fixtures.prescribedGoal(A, periodA, memberA, "structured", "trials", 4, 3, null, 9));
	}

	@Test
	void goalsReturnTheCaregiverTextAndLineage() {
		new JdbcTemplate(dataSource).update(
				"update goal set caregiver_text = 'simpler words', lineage = 'carried_over' where id = ?", aGoal());
		Map<String, Object> goal = get(DemoIdentityTests.ANNA, "/api/v1/goals", LIST).get(0);
		assertThat(goal).containsEntry("caregiverText", "simpler words")
			.containsEntry("lineage", "carried_over")
			.containsEntry("originalText", "original wording");
	}

}
