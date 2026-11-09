package app.littlesteps.family.web;

import java.util.Optional;

import app.littlesteps.family.api.CaregiverContext;
import app.littlesteps.family.api.CurrentCaregiver;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

/** The Caregiver that {@link CaregiverFilter} resolved for the current request. */
@Component
class RequestCaregiverContext implements CaregiverContext {

	@Override
	public Optional<CurrentCaregiver> current() {
		RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
		if (attributes == null) {
			return Optional.empty();
		}
		return Optional.ofNullable(
				(CurrentCaregiver) attributes.getAttribute(CaregiverFilter.ATTRIBUTE, RequestAttributes.SCOPE_REQUEST));
	}

}
