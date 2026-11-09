package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.ApplicationModule;

/** The skeleton matches the story and AD-1/AD-20: declared edges, layer packages, migration layout, no H2. */
class ModuleSkeletonTests {

	private static final Set<String> PLATFORM_API = Set.of("audit::api", "notifications::api", "metrics::api",
			"privacy::api");

	/** The solid edges of the AD-1 graph (plus goals to ai, the dotted RestrictionLookup edge). */
	private static final Map<String, Set<String>> FEATURE_EDGES = Map.of("family", Set.of(), "child",
			Set.of("family::api"), "careteam", Set.of("family::api"), "goals",
			Set.of("careteam::api", "child::api", "ai::api"), "library", Set.of("goals::api", "child::api", "ai::api"),
			"practice", Set.of("goals::api", "library::api", "careteam::api"), "planning",
			Set.of("goals::api", "library::api", "practice::api"), "progress",
			Set.of("practice::api", "goals::api", "ai::api"), "summary",
			Set.of("progress::api", "goals::api", "careteam::api", "ai::api"), "importer",
			Set.of("goals::api", "library::api", "ai::api"));

	private static final List<String> PLATFORM = List.of("ai", "notifications", "audit", "privacy", "metrics");

	private static final Path MAIN = Path.of("src", "main", "java", "app", "littlesteps");

	@Test
	void everyModuleDeclaresExactlyItsAd1Edges() throws Exception {
		for (var entry : FEATURE_EDGES.entrySet()) {
			Set<String> expected = new TreeSet<>(entry.getValue());
			expected.addAll(PLATFORM_API);
			expected.add("shared");
			assertThat(declared(entry.getKey())).as(entry.getKey()).isEqualTo(expected);
		}
		for (String module : PLATFORM) {
			assertThat(declared(module)).as(module).containsExactly("shared");
		}
		assertThat(declared("shared")).as("shared").isEmpty();
	}

	@Test
	void everyModuleHasTheFourLayerPackages() {
		Set<String> all = new TreeSet<>(FEATURE_EDGES.keySet());
		all.addAll(PLATFORM);
		all.add("shared");
		for (String module : all) {
			for (String layer : List.of("api", "web", "domain", "persistence")) {
				assertThat(MAIN.resolve(module).resolve(layer).resolve("package-info.java")).as(module + "/" + layer)
					.exists();
			}
			assertThat(MAIN.resolve(module).resolve("package-info.java")).exists();
		}
	}

	@Test
	void flywayMigrationsLiveInModuleFoldersWithTimestampedVersions() throws IOException {
		Path root = Path.of("src", "main", "resources", "db", "migration");
		Set<String> modules = new TreeSet<>(FEATURE_EDGES.keySet());
		modules.addAll(PLATFORM);
		modules.add("shared");
		Pattern name = Pattern.compile("V\\d{8}_\\d{4}__[a-z0-9_]+\\.sql");
		try (Stream<Path> files = Files.walk(root)) {
			List<Path> sql = files.filter(Files::isRegularFile).toList();
			assertThat(sql).isNotEmpty();
			for (Path file : sql) {
				assertThat(root.relativize(file).getNameCount()).as(file.toString()).isEqualTo(2);
				assertThat(modules).contains(root.relativize(file).getName(0).toString());
				assertThat(file.getFileName().toString()).matches(name);
			}
			assertThat(sql.stream().map(p -> p.getFileName().toString().split("__")[0]).distinct().count())
				.isEqualTo(sql.size());
		}
	}

	@Test
	void noH2AndGlobalTablesListsTheFamilyTables() throws IOException {
		assertThat(Files.readString(Path.of("pom.xml")).toLowerCase()).doesNotContain("h2database");
		assertThat(Files.readString(Path.of("GLOBAL_TABLES.md"))).contains("`families`", "`caregivers`",
				"`caregiver_membership`");
	}

	private static Set<String> declared(String module) throws Exception {
		Class<?> info = Class.forName("app.littlesteps." + module + ".package-info");
		return new TreeSet<>(Arrays.asList(info.getAnnotation(ApplicationModule.class).allowedDependencies()));
	}

}
