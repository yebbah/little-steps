package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.web.servlet.client.RestTestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.SerializationFeature;
import tools.jackson.databind.json.JsonMapper;

/**
 * Generates {@code target/openapi.json} on every build and fails when it differs from the committed
 * {@code backend/openapi.json}, which is the input of {@code npm run api:types}. Refresh the
 * committed file with {@code ./mvnw test -Dopenapi.update=true} and then run {@code npm run api:types}.
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT, properties = "springdoc.api-docs.enabled=true")
@AutoConfigureRestTestClient
class OpenApiContractTests extends IntegrationTest {

	private static final Path GENERATED = Path.of("target", "openapi.json");

	private static final Path COMMITTED = Path.of("openapi.json");

	@Autowired
	private RestTestClient client;

	@Test
	void generatedOpenApiMatchesTheCommittedContract() throws IOException {
		byte[] raw = client.get().uri("/v3/api-docs").exchange().expectStatus().isOk().returnResult()
			.getResponseBodyContent();
		ObjectMapper mapper = JsonMapper.builder().enable(SerializationFeature.INDENT_OUTPUT).build();
		JsonNode tree = mapper.readTree(raw);
		String generated = mapper.writeValueAsString(tree) + "\n";

		Files.createDirectories(GENERATED.getParent());
		Files.writeString(GENERATED, generated, StandardCharsets.UTF_8);
		if (Boolean.getBoolean("openapi.update")) {
			assertThat(System.getenv("CI")).as("openapi.update must not be used in CI").isNull();
			Files.writeString(COMMITTED, generated, StandardCharsets.UTF_8);
		}

		assertThat(tree.path("paths").has("/api/v1/ping")).isTrue();
		assertThat(tree.at("/paths/~1api~1v1~1ping/get/responses/400/content").has("application/problem+json")).isTrue();
		assertThat(COMMITTED).as("backend/openapi.json is missing: run ./mvnw test -Dopenapi.update=true").exists();
		assertThat(generated).as("openapi.json is out of date: run ./mvnw test -Dopenapi.update=true, then npm run api:types")
			.isEqualTo(Files.readString(COMMITTED, StandardCharsets.UTF_8));
	}

}
