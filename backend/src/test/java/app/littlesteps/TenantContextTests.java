package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import app.littlesteps.shared.persistence.TenantContext;
import org.junit.jupiter.api.Test;

/** The tenant holder: scoped, restorable and always cleared. */
class TenantContextTests {

	private static final UUID A = UUID.randomUUID();

	private static final UUID B = UUID.randomUUID();

	@Test
	void openAndCloseClears() {
		assertThat(TenantContext.current()).isEmpty();
		try (var scope = TenantContext.open(A)) {
			assertThat(TenantContext.current()).contains(A);
		}
		assertThat(TenantContext.current()).isEmpty();
	}

	@Test
	void aNestedOpenRestoresThePreviousTenant() {
		try (var outer = TenantContext.open(A)) {
			try (var inner = TenantContext.open(B)) {
				assertThat(TenantContext.current()).contains(B);
			}
			assertThat(TenantContext.current()).contains(A);
		}
		assertThat(TenantContext.current()).isEmpty();
	}

	@Test
	void closeAfterAnExceptionClears() {
		assertThatThrownBy(() -> {
			try (var scope = TenantContext.open(A)) {
				throw new IllegalStateException("boom");
			}
		}).isInstanceOf(IllegalStateException.class);
		assertThat(TenantContext.current()).isEmpty();
	}

}
