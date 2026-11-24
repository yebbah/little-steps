package app.littlesteps.ai.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

import app.littlesteps.ai.api.Guardrail;
import app.littlesteps.ai.api.GuardrailDecision;
import app.littlesteps.ai.api.GuardrailDecision.Flag;
import app.littlesteps.ai.api.GuardrailDecision.Outcome;
import app.littlesteps.ai.api.GuardrailItem;
import app.littlesteps.ai.api.GuardrailItem.Origin;
import app.littlesteps.ai.api.GuardrailScope;
import app.littlesteps.ai.api.RestrictionLookup;
import app.littlesteps.ai.api.RestrictionLookup.RestrictionSet;
import app.littlesteps.ai.api.ScopeClassifier;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * The Guardrail (AD-11). A deterministic Restriction match runs first. A match drops a curated or
 * AI-suggested item and keeps a prescribed one with {@code restriction-conflict}. If the check cannot
 * run, the same split applies (dropped, or kept with {@code check-unavailable}). The match result is
 * cached against the Family, the scope and the {@code restriction_set_version}: a different version
 * replaces the entry. The scope classifier is consulted only for items without a match, and its answers
 * are never cached.
 */
@Component
public class DefaultGuardrail implements Guardrail {

	private static final int MAX_ENTRIES = 1_000;

	private static final int MAX_ITEMS_PER_ENTRY = 10_000;

	private record Key(UUID familyId, UUID goalId) {
	}

	/** The compiled rules of one version and the match results computed against them. */
	private static final class Entry {

		final String version;

		final List<List<List<String>>> phrasesByRule;

		final ConcurrentHashMap<List<String>, Boolean> matches = new ConcurrentHashMap<>();

		Entry(RestrictionSet set) {
			this.version = set.version();
			List<List<List<String>>> rules = new ArrayList<>();
			for (RestrictionLookup.Rule rule : set.rules()) {
				List<List<String>> phrases = new ArrayList<>();
				boolean sensitivity = rule.source() == RestrictionLookup.Source.SENSITIVITY;
				for (String text : rule.texts()) {
					phrases.addAll(PhraseMatcher.targets(text, sensitivity));
				}
				for (String term : rule.avoidTerms()) {
					phrases.add(PhraseMatcher.words(term));
				}
				rules.add(phrases);
			}
			this.phrasesByRule = rules;
		}

	}

	private final RestrictionLookup lookup;

	private final Supplier<ScopeClassifier> classifier;

	private final ConcurrentHashMap<Key, Entry> cache = new ConcurrentHashMap<>();

	private final AtomicInteger computations = new AtomicInteger();

	private final AtomicInteger hits = new AtomicInteger();

	@Autowired
	DefaultGuardrail(RestrictionLookup lookup, ObjectProvider<ScopeClassifier> provider) {
		this.lookup = Objects.requireNonNull(lookup);
		this.classifier = () -> provider.getIfAvailable(DefaultScopeClassifier::new);
	}

	/** For tests and plain Java use; a null classifier means the default one. */
	public DefaultGuardrail(RestrictionLookup lookup, ScopeClassifier classifier) {
		this.lookup = Objects.requireNonNull(lookup);
		ScopeClassifier use = classifier == null ? new DefaultScopeClassifier() : classifier;
		this.classifier = () -> use;
	}

	@Override
	public List<GuardrailDecision> check(List<GuardrailItem> items, GuardrailScope scope) {
		if (items == null) {
			return List.of();
		}
		items = items.stream().filter(Objects::nonNull).toList();
		UUID goalId = scope == null ? null : scope.goalId();
		Entry entry;
		Key key;
		try {
			RestrictionSet set = Objects.requireNonNull(lookup.lookup(goalId), "restriction set");
			key = new Key(Objects.requireNonNull(set.familyId(), "family"), goalId);
			entry = cache.get(key);
			if (entry == null || !Objects.equals(entry.version, set.version())) {
				if (cache.size() >= MAX_ENTRIES) {
					cache.clear();
				}
				entry = new Entry(set);
				cache.put(key, entry);
			}
		}
		catch (RuntimeException ex) {
			return items.stream().map(this::uncheckable).toList();
		}
		ScopeClassifier scopeClassifier = classifierOrDefault();
		List<GuardrailDecision> decisions = new ArrayList<>(items.size());
		for (GuardrailItem item : items) {
			try {
				decisions.add(decide(item, entry, scopeClassifier));
			}
			catch (RuntimeException ex) {
				decisions.add(uncheckable(item));
			}
		}
		return decisions;
	}

	private ScopeClassifier classifierOrDefault() {
		try {
			ScopeClassifier c = classifier.get();
			return c != null ? c : new DefaultScopeClassifier();
		}
		catch (RuntimeException ex) {
			// More than one classifier, or one that cannot be built: treat every answer as unavailable.
			return item -> ScopeClassifier.Answer.UNAVAILABLE;
		}
	}

	private GuardrailDecision decide(GuardrailItem item, Entry entry, ScopeClassifier scopeClassifier) {
		boolean prescribed = item.origin() == Origin.PRESCRIBED;
		if (matches(item, entry)) {
			return prescribed ? new GuardrailDecision(item, Outcome.KEEP, List.of(Flag.RESTRICTION_CONFLICT))
					: new GuardrailDecision(item, Outcome.DROP, List.of());
		}
		ScopeClassifier.Answer answer;
		try {
			answer = scopeClassifier.classify(item);
		}
		catch (RuntimeException ex) {
			answer = ScopeClassifier.Answer.UNAVAILABLE;
		}
		if (answer == null) {
			answer = ScopeClassifier.Answer.UNAVAILABLE;
		}
		return switch (answer) {
			case CLEAR -> new GuardrailDecision(item, Outcome.KEEP, List.of());
			case CHECK_WITH_THERAPIST -> new GuardrailDecision(item, Outcome.KEEP, List.of(Flag.CHECK_WITH_THERAPIST));
			case UNAVAILABLE -> uncheckable(item);
		};
	}

	/** The check could not run: a prescribed item is kept and flagged, anything else is dropped. */
	private GuardrailDecision uncheckable(GuardrailItem item) {
		return item.origin() == Origin.PRESCRIBED
				? new GuardrailDecision(item, Outcome.KEEP, List.of(Flag.CHECK_UNAVAILABLE))
				: new GuardrailDecision(item, Outcome.DROP, List.of());
	}

	private boolean matches(GuardrailItem item, Entry entry) {
		List<String> words = PhraseMatcher.words(item.text());
		Boolean cached = entry.matches.get(words);
		if (cached != null) {
			hits.incrementAndGet();
			return cached;
		}
		computations.incrementAndGet();
		boolean matched = false;
		for (List<List<String>> phrases : entry.phrasesByRule) {
			for (List<String> phrase : phrases) {
				if (PhraseMatcher.contains(words, phrase)) {
					matched = true;
					break;
				}
			}
			if (matched) {
				break;
			}
		}
		if (entry.matches.size() >= MAX_ITEMS_PER_ENTRY) {
			entry.matches.clear();
		}
		entry.matches.put(words, matched);
		return matched;
	}

	/** How many item matches were computed (not served from the cache); for tests. */
	public int matchComputations() {
		return computations.get();
	}

	/** How many item matches were served from the cache; for tests. */
	public int cacheHits() {
		return hits.get();
	}

}
