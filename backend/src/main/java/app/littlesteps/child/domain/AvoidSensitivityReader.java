package app.littlesteps.child.domain;

import java.util.List;

import app.littlesteps.child.api.AvoidSensitivities;
import app.littlesteps.child.persistence.ChildSensitivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Reads the "avoid" sensitivities of the current Family; the tenant filter limits the read. */
@Service
class AvoidSensitivityReader implements AvoidSensitivities {

	private final ChildSensitivityRepository sensitivities;

	AvoidSensitivityReader(ChildSensitivityRepository sensitivities) {
		this.sensitivities = sensitivities;
	}

	@Override
	@Transactional(readOnly = true)
	public List<AvoidSensitivity> list() {
		return sensitivities.findByAvoidTrueOrderByOrdinalAscIdAsc()
			.stream()
			.map(s -> new AvoidSensitivity(s.getId(), s.getText()))
			.toList();
	}

}
