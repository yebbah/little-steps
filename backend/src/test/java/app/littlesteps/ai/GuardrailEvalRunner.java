package app.littlesteps.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import app.littlesteps.ai.api.GuardrailDecision;
import app.littlesteps.ai.api.GuardrailItem;
import app.littlesteps.ai.api.GuardrailItem.Kind;
import app.littlesteps.ai.api.GuardrailItem.Origin;
import app.littlesteps.ai.api.GuardrailScope;
import app.littlesteps.ai.api.RestrictionLookup;
import app.littlesteps.ai.api.ScopeClassifier;
import app.littlesteps.ai.domain.DefaultGuardrail;
import org.yaml.snakeyaml.Yaml;

/**
 * Runs the cases in {@code eval/guardrails/*.yaml} against the real {@link DefaultGuardrail} with an
 * in-memory {@link RestrictionLookup}. Needs no model and no database. Used by the untagged and the
 * {@code guardrail-eval} tagged tests, so the same files run in both.
 */
final class GuardrailEvalRunner {

	static final UUID FAMILY = UUID.fromString("0190a000-0000-7000-8000-0000000000e1");

	static final UUID GOAL_A = UUID.fromString("0190a000-0000-7000-8000-0000000000a1");

	static final UUID GOAL_B = UUID.fromString("0190a000-0000-7000-8000-0000000000b1");

	private GuardrailEvalRunner() {
	}

	record Case(String file, String name, boolean needsModel, List<Map<String, Object>> steps) {
	}

	static Path dir() {
		return Files.isDirectory(Path.of("eval", "guardrails")) ? Path.of("eval", "guardrails")
				: Path.of("..", "eval", "guardrails");
	}

	static List<Case> load() {
		List<Case> cases = new ArrayList<>();
		try (Stream<Path> files = Files.list(dir())) {
			for (Path file : files.filter(f -> f.toString().endsWith(".yaml")).sorted().toList()) {
				cases.addAll(parse(file.getFileName().toString(), Files.readString(file)));
			}
		}
		catch (IOException ex) {
			throw new UncheckedIOException(ex);
		}
		return cases;
	}

	private static final Set<String> CASE_KEYS = Set.of("name", "tags", "steps");

	private static final Set<String> STEP_KEYS = Set.of("scope", "restrictions", "sensitivities", "lookup", "items",
			"expect", "versionChanged");

	/** Parses and strictly validates one file; a malformed case is an error, never a silent pass. */
	@SuppressWarnings("unchecked")
	static List<Case> parse(String file, String yaml) {
		Object doc = new Yaml().load(yaml);
		if (!(doc instanceof Map<?, ?> top) || !(top.get("cases") instanceof List<?> list) || list.isEmpty()
				|| top.size() != 1) {
			throw bad(file, "needs a single top-level key 'cases' with a non-empty list");
		}
		List<Case> cases = new ArrayList<>();
		for (Object o : list) {
			Map<String, Object> c = map(file, o, "a case");
			unknown(file, c, CASE_KEYS, "case");
			String name = text(file, c.get("name"), "case name");
			List<String> tags = c.get("tags") == null ? List.of() : (List<String>) c.get("tags");
			for (String tag : tags) {
				if (!Set.of("guardrail-eval", "needs-model").contains(tag)) {
					throw bad(file, name + ": unknown tag " + tag);
				}
			}
			if (!(c.get("steps") instanceof List<?> steps) || steps.isEmpty()) {
				throw bad(file, name + ": needs at least one step");
			}
			int n = 0;
			for (Object s : steps) {
				validateStep(file, name + " (step " + (++n) + ")", map(file, s, "a step"));
			}
			cases.add(new Case(file, name, tags.contains("needs-model"), (List<Map<String, Object>>) c.get("steps")));
		}
		return cases;
	}

	@SuppressWarnings("unchecked")
	private static void validateStep(String file, String where, Map<String, Object> step) {
		unknown(file, step, STEP_KEYS, where);
		oneOf(file, where + " scope", step.getOrDefault("scope", "family"), Set.of("family", "goal-a", "goal-b"));
		oneOf(file, where + " lookup", step.getOrDefault("lookup", "ok"), Set.of("ok", "throws"));
		if (step.containsKey("versionChanged") && !(step.get("versionChanged") instanceof Boolean)) {
			throw bad(file, where + ": versionChanged must be true or false");
		}
		for (Map<String, Object> r : listOf(file, where + " restrictions", step.get("restrictions"))) {
			unknown(file, r, Set.of("text", "goal", "retired", "avoidTerms"), where + " restriction");
			text(file, r.get("text"), where + " restriction text");
			if (r.get("goal") != null) {
				oneOf(file, where + " restriction goal", r.get("goal"), Set.of("a", "b"));
			}
		}
		for (Map<String, Object> s : listOf(file, where + " sensitivities", step.get("sensitivities"))) {
			unknown(file, s, Set.of("text", "avoid"), where + " sensitivity");
			text(file, s.get("text"), where + " sensitivity text");
			if (!(s.get("avoid") instanceof Boolean)) {
				throw bad(file, where + ": a sensitivity needs avoid: true or false");
			}
		}
		List<Map<String, Object>> items = listOf(file, where + " items", step.get("items"));
		List<Map<String, Object>> expect = listOf(file, where + " expect", step.get("expect"));
		if (items.isEmpty()) {
			throw bad(file, where + ": needs items");
		}
		if (items.size() != expect.size()) {
			throw bad(file, where + ": " + items.size() + " items but " + expect.size() + " expected results");
		}
		for (Map<String, Object> i : items) {
			unknown(file, i, Set.of("kind", "origin", "text"), where + " item");
			oneOf(file, where + " item kind", i.get("kind"), Set.of("activity", "plan_item", "prep_card", "coach_tip"));
			oneOf(file, where + " item origin", i.get("origin"), Set.of("curated", "prescribed", "ai_suggested"));
			text(file, i.get("text"), where + " item text");
		}
		for (Map<String, Object> e : expect) {
			unknown(file, e, Set.of("outcome", "flags"), where + " expect");
			oneOf(file, where + " outcome", e.get("outcome"), Set.of("keep", "drop"));
			Object flags = e.getOrDefault("flags", List.of());
			if (!(flags instanceof List<?> fl) || !fl.stream()
				.allMatch(f -> Set.of("restriction-conflict", "check-with-therapist", "check-unavailable")
					.contains(f))) {
				throw bad(file, where + ": unknown flag in " + flags);
			}
		}
	}

	private static IllegalArgumentException bad(String file, String message) {
		return new IllegalArgumentException("eval/guardrails/" + file + ": " + message);
	}

	@SuppressWarnings("unchecked")
	private static Map<String, Object> map(String file, Object o, String what) {
		if (!(o instanceof Map<?, ?>)) {
			throw bad(file, what + " must be a mapping, not " + o);
		}
		return (Map<String, Object>) o;
	}

	@SuppressWarnings("unchecked")
	private static List<Map<String, Object>> listOf(String file, String what, Object o) {
		if (o == null) {
			return List.of();
		}
		if (!(o instanceof List<?>)) {
			throw bad(file, what + " must be a list");
		}
		for (Object e : (List<?>) o) {
			map(file, e, what + " entry");
		}
		return (List<Map<String, Object>>) o;
	}

	private static void unknown(String file, Map<String, Object> m, Set<String> allowed, String where) {
		for (String key : m.keySet()) {
			if (!allowed.contains(key)) {
				throw bad(file, where + ": unknown key '" + key + "'");
			}
		}
	}

	private static String text(String file, Object o, String what) {
		if (!(o instanceof String s) || s.isBlank()) {
			throw bad(file, what + " is missing or blank");
		}
		return s;
	}

	private static void oneOf(String file, String what, Object o, Set<String> allowed) {
		if (!(o instanceof String s) || !allowed.contains(s)) {
			throw bad(file, what + " must be one of " + new java.util.TreeSet<>(allowed) + ", not " + o);
		}
	}

	@SuppressWarnings("unchecked")
	static void run(Case c) {
		// One Guardrail per case, so its cache lives across the steps like in the app.
		MutableLookup lookup = new MutableLookup();
		DefaultGuardrail guardrail = new DefaultGuardrail(lookup, (ScopeClassifier) null);
		String previous = null;
		int stepNo = 0;
		for (Map<String, Object> step : c.steps()) {
			stepNo++;
			String label = c.file() + ": " + c.name() + " (step " + stepNo + ")";
			lookup.configure(step);
			if (!lookup.throwing) {
				String version = lookup.lookup(null).version();
				if (step.containsKey("versionChanged")) {
					assertThat(!version.equals(previous)).as(label + " versionChanged")
						.isEqualTo(step.get("versionChanged"));
				}
				previous = version;
			}
			List<GuardrailItem> items = new ArrayList<>();
			for (Map<String, Object> i : (List<Map<String, Object>>) step.get("items")) {
				items.add(new GuardrailItem(UUID.randomUUID(), Kind.valueOf(upper(i.get("kind"))),
						Origin.valueOf(upper(i.get("origin"))), (String) i.get("text")));
			}
			List<GuardrailDecision> decisions = guardrail.check(items, scopeOf((String) step.get("scope")));
			List<Map<String, Object>> expect = (List<Map<String, Object>>) step.get("expect");
			assertThat(decisions).as(label).hasSameSizeAs(expect);
			for (int n = 0; n < expect.size(); n++) {
				GuardrailDecision d = decisions.get(n);
				String at = label + " item " + (n + 1) + " \"" + items.get(n).text() + "\"";
				assertThat(d.outcome().name()).as(at).isEqualTo(upper(expect.get(n).get("outcome")));
				List<String> flags = (List<String>) expect.get(n).getOrDefault("flags", List.of());
				assertThat(d.flags().stream().map(GuardrailDecision.Flag::code).toList()).as(at + " flags")
					.isEqualTo(flags);
			}
		}
	}

	private static String upper(Object o) {
		return ((String) o).toUpperCase(Locale.ROOT);
	}

	private static GuardrailScope scopeOf(String scope) {
		return switch (scope == null ? "family" : scope) {
			case "goal-a" -> GuardrailScope.goal(GOAL_A);
			case "goal-b" -> GuardrailScope.goal(GOAL_B);
			default -> GuardrailScope.family();
		};
	}

	/** Builds the live set the way {@code goals} does: not retired, for the Goal and the Family, avoid only. */
	private static final class MutableLookup implements RestrictionLookup {

		boolean throwing;

		List<Map<String, Object>> restrictions = List.of();

		List<Map<String, Object>> sensitivities = List.of();

		@SuppressWarnings("unchecked")
		void configure(Map<String, Object> step) {
			throwing = "throws".equals(step.get("lookup"));
			restrictions = (List<Map<String, Object>>) step.getOrDefault("restrictions", List.of());
			sensitivities = (List<Map<String, Object>>) step.getOrDefault("sensitivities", List.of());
		}

		@Override
		@SuppressWarnings("unchecked")
		public RestrictionSet lookup(UUID goalId) {
			if (throwing) {
				throw new IllegalStateException("lookup unavailable");
			}
			StringBuilder canonical = new StringBuilder();
			List<Rule> rules = new ArrayList<>();
			for (Map<String, Object> r : restrictions) {
				if (Boolean.TRUE.equals(r.get("retired"))) {
					continue;
				}
				canonical.append("R|").append(r).append('\n');
				UUID goal = r.get("goal") == null ? null : "a".equals(r.get("goal")) ? GOAL_A : GOAL_B;
				if (goal == null || goal.equals(goalId)) {
					rules.add(new Rule(Source.RESTRICTION, UUID.randomUUID(), List.of((String) r.get("text")),
							(List<String>) r.getOrDefault("avoidTerms", List.of())));
				}
			}
			for (Map<String, Object> s : sensitivities) {
				if (Boolean.TRUE.equals(s.get("avoid"))) {
					canonical.append("S|").append(s).append('\n');
					rules.add(new Rule(Source.SENSITIVITY, UUID.randomUUID(), List.of((String) s.get("text")),
							List.of()));
				}
			}
			try {
				String version = HexFormat.of()
					.formatHex(MessageDigest.getInstance("SHA-256")
						.digest(canonical.toString().getBytes(StandardCharsets.UTF_8)));
				return new RestrictionSet(FAMILY, version, rules);
			}
			catch (java.security.NoSuchAlgorithmException ex) {
				throw new IllegalStateException(ex);
			}
		}

	}

}
