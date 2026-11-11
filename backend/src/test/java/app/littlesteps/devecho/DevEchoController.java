package app.littlesteps.devecho;

import java.util.UUID;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Test-only (profile {@code test}, and the class lives under {@code src/test}): stores a body under the
 * Caregiver's Family and returns it. Replaying the same {@code PUT} is a no-op that returns the stored
 * body (AD-4). The Family is never a request value: it comes from the tenant.
 */
@Hidden
@Profile("test")
@RestController
@RequestMapping("/api/v1/dev/echo")
public class DevEchoController {

	private final DevEchoRepository repository;

	DevEchoController(DevEchoRepository repository) {
		this.repository = repository;
	}

	@PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	String put(@PathVariable UUID id, @RequestBody String body) {
		return repository.findById(id).map(DevEcho::getBody).orElseGet(() -> store(id, body));
	}

	private String store(UUID id, String body) {
		try {
			return repository.saveAndFlush(new DevEcho(id, body)).getBody();
		}
		catch (DataIntegrityViolationException ex) {
			// A concurrent PUT of this id by this Family won the race: replay semantics, return its body. The
			// read is tenant-filtered, so a row held by another Family stays invisible and is a conflict.
			return repository.findById(id)
				.map(DevEcho::getBody)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT));
		}
	}

}
