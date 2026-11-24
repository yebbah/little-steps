package app.littlesteps.child.domain;

import java.util.List;
import java.util.Optional;

import app.littlesteps.child.persistence.ChildProfile;
import app.littlesteps.child.persistence.ChildProfileRepository;
import app.littlesteps.child.persistence.ChildSensitivity;
import app.littlesteps.child.persistence.ChildSensitivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Read side of the Child Profile. The tenant filter limits both reads to the current Family. */
@Service
public class ChildProfileService {

	/** A profile with its sensitivities, in order. */
	public record Profile(ChildProfile profile, List<ChildSensitivity> sensitivities) {
	}

	private final ChildProfileRepository profiles;

	private final ChildSensitivityRepository sensitivities;

	ChildProfileService(ChildProfileRepository profiles, ChildSensitivityRepository sensitivities) {
		this.profiles = profiles;
		this.sensitivities = sensitivities;
	}

	@Transactional(readOnly = true)
	public Optional<Profile> find() {
		return profiles.findFirstByOrderByIdAsc()
			.map(p -> new Profile(p, sensitivities.findByChildProfileIdOrderByOrdinalAscIdAsc(p.getId())));
	}

}
