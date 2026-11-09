package app.littlesteps.tenantprobe;

import java.util.List;
import java.util.UUID;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Test-only Family endpoints. The Family is never a request value: it comes from the tenant. */
@Hidden
@RestController
@RequestMapping("/api/v1/test-probes")
class TenantProbeController {

	record Body(String label) {
	}

	record View(UUID id, String label) {
	}

	private final TenantProbeRepository repository;

	TenantProbeController(TenantProbeRepository repository) {
		this.repository = repository;
	}

	@GetMapping
	List<View> list() {
		return repository.findAll().stream().map(p -> new View(p.getId(), p.getLabel())).toList();
	}

	@GetMapping("/{id}")
	View get(@PathVariable UUID id) {
		return repository.findById(id)
			.map(p -> new View(p.getId(), p.getLabel()))
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
	}

	@PutMapping("/{id}")
	View put(@PathVariable UUID id, @RequestBody Body body) {
		try {
			TenantProbe probe = repository.findById(id).orElseGet(() -> new TenantProbe(id, body.label()));
			probe.setLabel(body.label());
			TenantProbe saved = repository.saveAndFlush(probe);
			return new View(saved.getId(), saved.getLabel());
		}
		catch (DataIntegrityViolationException ex) {
			throw new ResponseStatusException(HttpStatus.CONFLICT);
		}
	}

}
