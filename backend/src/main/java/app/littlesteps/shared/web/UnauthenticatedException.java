package app.littlesteps.shared.web;

/** No Caregiver is signed in: answered as problem type {@code unauthenticated} (401). Carries no message. */
public class UnauthenticatedException extends RuntimeException {

	public UnauthenticatedException() {
		super(null, null, false, false);
	}

}
