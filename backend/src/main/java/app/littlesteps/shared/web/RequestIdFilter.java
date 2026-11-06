package app.littlesteps.shared.web;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerMapping;

/**
 * Gives every request an ID, puts it in the logging context ({@code requestId}) and the
 * {@code X-Request-Id} response header, and writes one access line per request: method, matched
 * route pattern, status and duration. It never logs the raw path, query string, headers or any body
 * (AD-19). A caller-supplied ID is untrusted: it only correlates log lines and proves nothing.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
class RequestIdFilter extends OncePerRequestFilter {

	static final String HEADER = "X-Request-Id";

	static final String MDC_KEY = "requestId";

	/** A caller-supplied ID is accepted only in this shape, so it cannot forge or inject log content. */
	private static final Pattern SAFE_ID = Pattern.compile("[A-Za-z0-9-]{8,64}");

	private static final Logger log = LoggerFactory.getLogger("app.littlesteps.http");

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		String supplied = request.getHeader(HEADER);
		String requestId = (supplied != null && SAFE_ID.matcher(supplied).matches()) ? supplied
				: UUID.randomUUID().toString();
		MDC.put(MDC_KEY, requestId);
		response.setHeader(HEADER, requestId);
		long start = System.nanoTime();
		int status = 500;
		try {
			chain.doFilter(request, response);
			status = response.getStatus();
		}
		finally {
			long millis = (System.nanoTime() - start) / 1_000_000;
			// Log the matched route pattern, never the raw path: path variables can hold identifying text.
			Object pattern = request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
			log.info("{} {} -> {} in {} ms", request.getMethod(), pattern != null ? pattern : "UNMATCHED", status,
					millis);
			MDC.remove(MDC_KEY);
		}
	}

}
