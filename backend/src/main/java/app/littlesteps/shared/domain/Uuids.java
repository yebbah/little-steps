package app.littlesteps.shared.domain;

import java.security.SecureRandom;
import java.util.UUID;

/** UUIDv7 generation (AD-4): a 48-bit millisecond timestamp followed by random bits. */
public final class Uuids {

	private static final SecureRandom RANDOM = new SecureRandom();

	private Uuids() {
	}

	public static UUID v7() {
		long millis = System.currentTimeMillis();
		long msb = (millis << 16) | 0x7000L | (RANDOM.nextLong() & 0x0FFFL);
		long lsb = (RANDOM.nextLong() & 0x3FFFFFFFFFFFFFFFL) | 0x8000000000000000L;
		return new UUID(msb, lsb);
	}

}
