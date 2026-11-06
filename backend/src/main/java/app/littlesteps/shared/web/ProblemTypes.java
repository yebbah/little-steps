package app.littlesteps.shared.web;

import java.net.URI;

import org.springframework.http.HttpStatus;

/**
 * The registry of RFC 9457 problem types (AD-20). Every error response takes its {@code type} from
 * here, so the client can map a type to catalog copy. The server sends codes, never UI sentences:
 * {@link #title()} is a stable English label for developers, not for display.
 */
public enum ProblemTypes {

	VALIDATION("validation", HttpStatus.BAD_REQUEST, "Validation failed"),
	MALFORMED_REQUEST("malformed-request", HttpStatus.BAD_REQUEST, "Malformed request"),
	UNAUTHENTICATED("unauthenticated", HttpStatus.UNAUTHORIZED, "Authentication required"),
	FORBIDDEN("forbidden", HttpStatus.FORBIDDEN, "Forbidden"),
	NOT_FOUND("not-found", HttpStatus.NOT_FOUND, "Not found"),
	METHOD_NOT_ALLOWED("method-not-allowed", HttpStatus.METHOD_NOT_ALLOWED, "Method not allowed"),
	NOT_ACCEPTABLE("not-acceptable", HttpStatus.NOT_ACCEPTABLE, "Not acceptable"),
	UNSUPPORTED_MEDIA_TYPE("unsupported-media-type", HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported media type"),
	CONFLICT("conflict", HttpStatus.CONFLICT, "Conflict"),
	PAYLOAD_TOO_LARGE("payload-too-large", HttpStatus.CONTENT_TOO_LARGE, "Payload too large"),
	UNAVAILABLE("unavailable", HttpStatus.SERVICE_UNAVAILABLE, "Service unavailable"),
	INTERNAL("internal", HttpStatus.INTERNAL_SERVER_ERROR, "Internal error");

	/** Prefix of every problem type URI. A URN, so it names no host. */
	public static final String PREFIX = "urn:littlesteps:problem:";

	private final String slug;

	private final HttpStatus status;

	private final String title;

	ProblemTypes(String slug, HttpStatus status, String title) {
		this.slug = slug;
		this.status = status;
		this.title = title;
	}

	public String slug() {
		return slug;
	}

	public HttpStatus status() {
		return status;
	}

	public String title() {
		return title;
	}

	public URI uri() {
		return URI.create(PREFIX + slug);
	}

	/** The type for a status when no more specific one applies. */
	public static ProblemTypes forStatus(int status) {
		for (ProblemTypes type : values()) {
			if (type.status.value() == status) {
				return type;
			}
		}
		return status >= 500 ? INTERNAL : MALFORMED_REQUEST;
	}

}
