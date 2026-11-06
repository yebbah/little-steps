package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import com.tngtech.archunit.core.importer.ImportOption;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.core.Violations;
import org.springframework.modulith.docs.Documenter;

import modulith.fixture.FixtureApplication;

/**
 * Enforces AD-1: the module graph is closed. {@code verify()} fails the build on a forbidden
 * dependency, a cycle, or a use of another module's internals. Needs no database.
 */
class ModularityTests {

	private static final Set<String> EXPECTED = Set.of("shared", "family", "child", "careteam", "goals", "library",
			"practice", "planning", "progress", "summary", "importer", "ai", "notifications", "audit", "privacy",
			"metrics");

	/** The default scan skips test classes; the fixture lives in src/test. */
	private static final ImportOption INCLUDE_TESTS = location -> true;

	private final ApplicationModules modules = ApplicationModules.of(LittlestepsApplication.class);

	@Test
	void theAgreedModulesExistAndNothingElse() {
		Set<String> names = modules.stream().map(m -> m.getIdentifier().toString()).collect(Collectors.toSet());
		assertThat(names).isEqualTo(EXPECTED);
	}

	@Test
	void moduleGraphIsValid() {
		assertThatCode(modules::verify).doesNotThrowAnyException();
	}

	@Test
	void generatesModuleDocumentation() {
		new Documenter(modules).writeModulesAsPlantUml().writeIndividualModulesAsPlantUml();
		assertThat(java.nio.file.Path.of("target", "spring-modulith-docs", "components.puml")).exists();
	}

	@Test
	void aForbiddenDependencyMakesVerifyFail() {
		// alpha has no allowed dependencies but calls beta's api: AD-1 says that edge does not exist.
		ApplicationModules fixture = ApplicationModules.of(FixtureApplication.class, INCLUDE_TESTS);
		assertThatThrownBy(fixture::verify).isInstanceOf(Violations.class)
			.hasMessageContaining("alpha")
			.hasMessageContaining("beta");
	}

}
