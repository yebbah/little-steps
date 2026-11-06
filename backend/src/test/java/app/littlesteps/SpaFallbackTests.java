package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.client.RestTestClient;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
class SpaFallbackTests {

	@Autowired
	private RestTestClient client;

	private String body(String uri, HttpStatus status) {
		return client.get()
			.uri(uri)
			.exchange()
			.expectStatus()
			.isEqualTo(status)
			.expectBody(String.class)
			.returnResult()
			.getResponseBody();
	}

	@Test
	void rootServesIndexHtml() {
		assertThat(body("/", HttpStatus.OK)).contains("id=\"root\"");
	}

	@Test
	void clientRouteServesIndexHtml() {
		assertThat(body("/children/1", HttpStatus.OK)).contains("id=\"root\"");
	}

	@Test
	void unknownApiPathIsNotFoundAndNotIndexHtml() {
		client.get().uri("/api/nope").exchange().expectStatus().isNotFound();
		client.get().uri("/api").exchange().expectStatus().isNotFound();
	}

	@Test
	void missingAssetIsNotFound() {
		client.get().uri("/assets/x.js").exchange().expectStatus().isNotFound();
	}

	@Test
	void unknownActuatorPathIsNotFound() {
		client.get().uri("/actuator/nope").exchange().expectStatus().isNotFound();
	}

	@Test
	void indexAndFallbackAreNotCached() {
		client.get().uri("/").exchange().expectHeader().cacheControl(CacheControl.noCache());
		client.get().uri("/children/1").exchange().expectHeader().cacheControl(CacheControl.noCache());
		client.get().uri("/sw.js").exchange().expectStatus().isOk().expectHeader().cacheControl(CacheControl.noCache());
	}

	@Test
	void hashedAssetsAreCachedForAYear() {
		client.get()
			.uri("/assets/app-abc123.js")
			.exchange()
			.expectStatus()
			.isOk()
			.expectHeader()
			.value("Cache-Control", v -> assertThat(v).contains("max-age=31536000").contains("immutable"));
	}

	@Test
	void healthStillWorks() {
		assertThat(body("/actuator/health", HttpStatus.OK)).contains("\"status\":\"UP\"");
	}

}
