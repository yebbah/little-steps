package modulith.fixture;

import org.springframework.modulith.Modulithic;

/**
 * Root of a throwaway two-module application used only by ModularityTests. It lives outside
 * {@code app.littlesteps} so the real module scan never sees it.
 */
@Modulithic
public class FixtureApplication {

}
