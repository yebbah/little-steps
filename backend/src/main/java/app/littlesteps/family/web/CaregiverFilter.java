package app.littlesteps.family.web;

import java.io.IOException;

import app.littlesteps.family.api.CurrentCaregiver;
import app.littlesteps.shared.persistence.TenantContext;
import app.littlesteps.shared.web.UnauthenticatedException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

/**
 * Resolves the Caregiver of every {@code /api/v1} request except {@code /api/v1/ping}, sets the
 * tenant from the Caregiver's active membership and clears it afterwards. With no Caregiver the
 * request is answered {@code 401 unauthenticated} through the problem handler. Story 3.1 replaces
 * this temporary filter with Spring Security.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
class CaregiverFilter extends OncePerRequestFilter {

	static final String ATTRIBUTE = CaregiverFilter.class.getName() + ".caregiver";

	private final ObjectProvider<CaregiverResolver> resolver;

	private final HandlerExceptionResolver exceptions;

	CaregiverFilter(ObjectProvider<CaregiverResolver> resolver,
			@Qualifier("handlerExceptionResolver") HandlerExceptionResolver exceptions) {
		this.resolver = resolver;
		this.exceptions = exceptions;
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		// The container's decoded, normalised path (no percent-encoding, ';' parameters or dot segments),
		// which is what Spring MVC routes on. The raw request URI would let encoded forms skip the gate.
		String path = (request.getServletPath() + (request.getPathInfo() == null ? "" : request.getPathInfo()))
			.replaceAll("/{2,}", "/");
		boolean api = path.equals("/api/v1") || path.startsWith("/api/v1/");
		return !api || path.equals("/api/v1/ping");
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		CurrentCaregiver caregiver;
		try {
			CaregiverResolver source = resolver.getIfAvailable();
			caregiver = source == null ? null : source.resolve(request).orElse(null);
		}
		catch (RuntimeException ex) {
			exceptions.resolveException(request, response, null, ex);
			return;
		}
		if (caregiver == null) {
			exceptions.resolveException(request, response, null, new UnauthenticatedException());
			return;
		}
		request.setAttribute(ATTRIBUTE, caregiver);
		try (TenantContext.Scope scope = TenantContext.open(caregiver.familyId())) {
			chain.doFilter(request, response);
		}
	}

}
