package app.littlesteps.shared.web;

import org.jspecify.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Turns every failed request into an RFC 9457 {@code application/problem+json} response whose
 * {@code type} comes from {@link ProblemTypes}.
 *
 * <p>
 * Responses never echo exception messages: they can carry request values, and request values can be
 * Caregiver text (AD-19). The {@code detail} member is left out and the {@code requestId} member
 * lets support find the matching log line.
 */
@RestControllerAdvice
class ProblemExceptionHandler extends ResponseEntityExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(ProblemExceptionHandler.class);

	@ExceptionHandler(Exception.class)
	ResponseEntity<Object> handleUnexpected(Exception ex, WebRequest request) {
		// Stack trace kept for now (decision on #32). The message and trace can contain request values;
		// the error-reference follow-up replaces this with a stored, reference-keyed record.
		log.error("Unhandled exception of type {}", ex.getClass().getName(), ex);
		return handleExceptionInternal(ex, null, new HttpHeaders(), ProblemTypes.INTERNAL.status(), request);
	}

	@Override
	protected @Nullable ResponseEntity<Object> handleExceptionInternal(Exception ex, @Nullable Object body,
			HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
		ProblemTypes type = typeOf(ex, statusCode);
		ProblemDetail problem = (body instanceof ProblemDetail existing) ? existing
				: ProblemDetail.forStatus(statusCode);
		problem.setType(type.uri());
		problem.setTitle(type.title());
		problem.setDetail(null);
		String requestId = MDC.get(RequestIdFilter.MDC_KEY);
		if (requestId != null) {
			problem.setProperty("requestId", requestId);
		}
		HttpHeaders out = new HttpHeaders();
		out.putAll(headers);
		out.setContentType(MediaType.APPLICATION_PROBLEM_JSON);
		return super.handleExceptionInternal(ex, problem, out, statusCode, request);
	}

	private static ProblemTypes typeOf(Exception ex, HttpStatusCode status) {
		if (ex instanceof org.springframework.web.method.annotation.HandlerMethodValidationException
				|| ex instanceof org.springframework.web.bind.MethodArgumentNotValidException
				|| ex instanceof org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
				|| ex instanceof org.springframework.web.bind.MissingServletRequestParameterException) {
			return ProblemTypes.VALIDATION;
		}
		if (ex instanceof org.springframework.http.converter.HttpMessageNotReadableException) {
			return ProblemTypes.MALFORMED_REQUEST;
		}
		return ProblemTypes.forStatus(status.value());
	}

}
