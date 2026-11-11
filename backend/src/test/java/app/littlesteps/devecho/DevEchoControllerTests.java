package app.littlesteps.devecho;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** The race between two PUTs of one id: the loser must not turn a good replay into a conflict. */
class DevEchoControllerTests {

	private static final UUID ID = UUID.fromString("0190a000-0000-7000-8000-00000000ec02");

	private final DevEchoRepository repository = mock(DevEchoRepository.class);

	private final DevEchoController controller = new DevEchoController(repository);

	@Test
	void aConcurrentPutByTheSameFamilyReturnsTheStoredBody() {
		when(repository.findById(ID)).thenReturn(Optional.empty(), Optional.of(new DevEcho(ID, "{\"n\":1}")));
		when(repository.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException("duplicate key"));
		assertThat(controller.put(ID, "{\"n\":2}")).isEqualTo("{\"n\":1}");
	}

	@Test
	void anIdHeldByAnotherFamilyIsStillAConflict() {
		when(repository.findById(ID)).thenReturn(Optional.empty());
		when(repository.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException("duplicate key"));
		assertThatThrownBy(() -> controller.put(ID, "{}")).isInstanceOfSatisfying(ResponseStatusException.class,
				ex -> assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
	}

}
