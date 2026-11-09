package app.littlesteps.family.web;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import app.littlesteps.family.api.CurrentCaregiver;
import app.littlesteps.family.persistence.Caregiver;
import app.littlesteps.family.persistence.CaregiverMembershipRepository;
import app.littlesteps.family.persistence.CaregiverRepository;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Demo stand-in for the token (AD-3): the Caregiver is named by the {@code X-Demo-Caregiver}
 * header, or is the earliest-created one. An unknown ID, a malformed ID or a Caregiver without an
 * active membership resolves to none (401). It is a bean only in {@code local} and {@code test}
 * with {@code littlesteps.demo.enabled} on; see {@link DemoConfiguration}.
 */
class DemoCaregiverResolver implements CaregiverResolver {

	static final String HEADER = "X-Demo-Caregiver";

	private final CaregiverRepository caregivers;

	private final CaregiverMembershipRepository memberships;

	DemoCaregiverResolver(CaregiverRepository caregivers, CaregiverMembershipRepository memberships) {
		this.caregivers = caregivers;
		this.memberships = memberships;
	}

	@Override
	public Optional<CurrentCaregiver> resolve(HttpServletRequest request) {
		String header = request.getHeader(HEADER);
		Optional<Caregiver> caregiver;
		if (header == null) {
			caregiver = caregivers.findFirstByOrderByCreatedAtAscIdAsc();
		}
		else {
			UUID id;
			try {
				id = UUID.fromString(header.trim());
			}
			catch (IllegalArgumentException ex) {
				return Optional.empty();
			}
			caregiver = caregivers.findById(id);
		}
		return caregiver.flatMap(c -> memberships.findByCaregiverIdAndEndedAtIsNull(c.getId())
			.map(m -> new CurrentCaregiver(c.getId(), c.getSub(), m.getFamilyId())));
	}

	Optional<Caregiver> caregiver(UUID id) {
		return caregivers.findById(id);
	}

	List<Caregiver> allCaregivers() {
		return caregivers.findAllByOrderByCreatedAtAscIdAsc();
	}

}
