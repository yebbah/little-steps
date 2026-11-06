package app.littlesteps;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;
import org.yaml.snakeyaml.Yaml;

/**
 * Base class for tests that need the application and a real database. It starts one Testcontainers
 * PostgreSQL per test run, from the same image and digest as {@code deploy/compose.yaml}: the reference
 * is read from {@code deploy/images.yaml}, so there is no second copy to drift. No test uses H2.
 * Flyway runs the real migrations against it.
 */
@SpringBootTest
@ActiveProfiles("test")
public abstract class IntegrationTest {

	private static final String POSTGRES_IMAGE = "dhi.io/postgres";

	@DynamicPropertySource
	static void datasource(DynamicPropertyRegistry registry) {
		PostgreSQLContainer postgres = SharedContainer.INSTANCE;
		registry.add("spring.datasource.url", postgres::getJdbcUrl);
		registry.add("spring.datasource.username", postgres::getUsername);
		registry.add("spring.datasource.password", postgres::getPassword);
	}

	/** Started once and shared by every test class; Ryuk removes it when the JVM ends. */
	private static final class SharedContainer {

		static final PostgreSQLContainer INSTANCE = start();

		private static PostgreSQLContainer start() {
			DockerImageName image = DockerImageName.parse(postgresReference()).asCompatibleSubstituteFor("postgres");
			PostgreSQLContainer container = new PostgreSQLContainer(image);
			// The DHI entrypoint already runs postgres: the default command's leading "postgres" would be rejected.
			container.withCommand("-c", "fsync=off");
			container.start();
			return container;
		}

	}

	/** The {@code name:tag@digest} of the PostgreSQL entry in deploy/images.yaml. */
	static String postgresReference() {
		// Tests run with backend/ or the repository root as working directory (Maven or an IDE).
		Path manifest = Files.exists(Path.of("deploy", "images.yaml")) ? Path.of("deploy", "images.yaml")
				: Path.of("..", "deploy", "images.yaml");
		try {
			Map<String, Object> doc = new Yaml().load(Files.readString(manifest));
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> images = (List<Map<String, Object>>) doc.get("images");
			return images.stream()
				.filter(i -> POSTGRES_IMAGE.equals(i.get("name")))
				.map(i -> i.get("name") + ":" + i.get("tag") + "@" + i.get("digest"))
				.findFirst()
				.orElseThrow(() -> new IllegalStateException(POSTGRES_IMAGE + " is missing from " + manifest));
		}
		catch (IOException ex) {
			throw new UncheckedIOException("Cannot read " + manifest, ex);
		}
	}

}
