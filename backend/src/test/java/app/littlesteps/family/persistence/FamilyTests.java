package app.littlesteps.family.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class FamilyTests {

	@Test
	void aRegionIdIsAccepted() {
		assertThat(Family.create("Europe/Paris").getTimezone()).isEqualTo("Europe/Paris");
	}

	@Test
	void offsetsAndUnknownIdsAreRejected() {
		for (String bad : new String[] { "+02:00", "UTC+2", "GMT+02:00", "Mars/Olympus", "" }) {
			assertThatThrownBy(() -> Family.create(bad)).as(bad).isInstanceOf(IllegalArgumentException.class);
		}
	}

}
