package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import app.littlesteps.shared.domain.Uuids;
import org.junit.jupiter.api.Test;

class UuidsTests {

	@Test
	void layoutIsVersion7Variant2WithACurrentTimestamp() {
		long before = System.currentTimeMillis();
		UUID id = Uuids.v7();
		long after = System.currentTimeMillis();
		assertThat(id.version()).isEqualTo(7);
		assertThat(id.variant()).isEqualTo(2);
		long timestamp = id.getMostSignificantBits() >>> 16;
		assertThat(timestamp).isBetween(before - 5_000, after + 5_000);
		assertThat(timestamp).isBetween(before, after);
	}

	@Test
	void idsFromDifferentMillisecondsSortInTimeOrder() throws InterruptedException {
		UUID first = Uuids.v7();
		Thread.sleep(3);
		UUID second = Uuids.v7();
		Thread.sleep(3);
		UUID third = Uuids.v7();
		assertThat(first.toString()).isLessThan(second.toString());
		assertThat(second.toString()).isLessThan(third.toString());
	}

	@Test
	void idsAreUnique() {
		assertThat(java.util.stream.Stream.generate(Uuids::v7).limit(1000).distinct().count()).isEqualTo(1000);
	}

}
