package app.littlesteps.goals.domain;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import app.littlesteps.ai.api.RestrictionLookup;
import app.littlesteps.child.api.AvoidSensitivities;
import app.littlesteps.child.api.AvoidSensitivities.AvoidSensitivity;
import app.littlesteps.goals.domain.StrategyRestrictionService.RestrictionView;
import app.littlesteps.goals.persistence.GoalRepository;
import app.littlesteps.shared.persistence.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The Family's live Restriction set for the Guardrail (AD-11): Restrictions that are not retired (those
 * of the Goal in scope and the Family-level ones) and the "avoid" sensitivities, read from the database
 * and {@code child.api} on every call. The version is a SHA-256 over the Family's whole live set, so it
 * changes with any Restriction, avoid term, retirement or sensitivity change and is stable otherwise.
 */
@Service
class FamilyRestrictionLookup implements RestrictionLookup {

	private final StrategyRestrictionService restrictions;

	private final AvoidSensitivities sensitivities;

	private final GoalRepository goals;

	FamilyRestrictionLookup(StrategyRestrictionService restrictions, AvoidSensitivities sensitivities,
			GoalRepository goals) {
		this.goals = goals;
		this.restrictions = restrictions;
		this.sensitivities = sensitivities;
	}

	@Override
	// A failed lookup is expected and handled by the Guardrail: it must not mark the caller's transaction rollback-only.
	@Transactional(readOnly = true, noRollbackFor = RuntimeException.class)
	public RestrictionSet lookup(UUID goalId) {
		UUID familyId = TenantContext.current()
			.orElseThrow(() -> new IllegalStateException("No Family: the Restriction set needs a tenant"));
		if (goalId != null && goals.findById(goalId).isEmpty()) {
			throw new IllegalArgumentException("The Goal is not one of this Family's Goals");
		}
		List<RestrictionView> live = restrictions.listRestrictions()
			.stream()
			.filter(v -> v.restriction().getRetiredAt() == null)
			.toList();
		List<AvoidSensitivity> avoid = sensitivities.list();

		List<Rule> rules = new ArrayList<>();
		StringBuilder canonical = new StringBuilder();
		for (RestrictionView v : live) {
			var r = v.restriction();
			List<String> texts = new ArrayList<>();
			texts.add(r.getOriginalText());
			if (r.getCaregiverText() != null) {
				texts.add(r.getCaregiverText());
			}
			List<String> terms = v.avoidTerms().stream().map(t -> t.getTerm()).toList();
			canonical.append("R|").append(r.getId()).append('|').append(r.getGoalId()).append('|')
				.append(r.getOriginalText().length()).append(':').append(r.getOriginalText()).append('|')
				.append(r.getCaregiverText() == null ? "-" : r.getCaregiverText().length() + ":" + r.getCaregiverText());
			for (String t : terms) {
				canonical.append("|T").append(t.length()).append(':').append(t);
			}
			canonical.append('\n');
			// A Goal-level Restriction applies to its own Goal only; a Family-level one always applies.
			if (r.getGoalId() == null || Objects.equals(r.getGoalId(), goalId)) {
				rules.add(new Rule(Source.RESTRICTION, r.getId(), texts, terms));
			}
		}
		for (AvoidSensitivity s : avoid) {
			canonical.append("S|").append(s.id()).append('|').append(s.text().length()).append(':').append(s.text())
				.append('\n');
			rules.add(new Rule(Source.SENSITIVITY, s.id(), List.of(s.text()), List.of()));
		}
		return new RestrictionSet(familyId, sha256(canonical.toString()), rules);
	}

	private static String sha256(String text) {
		try {
			return HexFormat.of()
				.formatHex(MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8)));
		}
		catch (NoSuchAlgorithmException ex) {
			throw new IllegalStateException(ex);
		}
	}

}
