package modulith.fixture.alpha;

import modulith.fixture.beta.api.BetaApi;

/** Forbidden on purpose: alpha declares no dependencies but uses beta. */
public class AlphaService {

	BetaApi beta = new BetaApi();

}
