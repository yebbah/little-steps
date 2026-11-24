package app.littlesteps.ai.api;

import java.util.List;
import java.util.UUID;

/**
 * The Family's live Restriction set (AD-11), supplied by {@code goals}. It is read each time, never
 * copied: Restrictions that are not retired, for the Goal and the Family, plus the Child Profile
 * sensitivities marked "avoid".
 */
public interface RestrictionLookup {

	/** @param goalId the Goal in scope, or null for the Family-level set only */
	RestrictionSet lookup(UUID goalId);

	/**
	 * The rules and the version of the Family's whole live set. {@code version} changes when any
	 * Restriction, avoid term, retirement or sensitivity changes, and is stable otherwise.
	 */
	record RestrictionSet(UUID familyId, String version, List<Rule> rules) {

		public RestrictionSet {
			rules = List.copyOf(rules);
		}

	}

	/**
	 * One thing to avoid. {@code texts} are the wordings of a Restriction (Care Team and Caregiver) or the
	 * text of a sensitivity; the target phrase is taken from them. {@code avoidTerms} are plain phrases.
	 */
	record Rule(Source source, UUID id, List<String> texts, List<String> avoidTerms) {

		public Rule {
			texts = List.copyOf(texts);
			avoidTerms = List.copyOf(avoidTerms);
		}

	}

	/** Where a rule comes from. */
	enum Source {

		RESTRICTION, SENSITIVITY

	}

}
