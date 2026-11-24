package app.littlesteps.ai.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * The deterministic text matching of the Guardrail (AD-11). Text is lowercased, punctuation becomes a
 * space and a plural ending is ignored; a phrase matches when its words appear in a row, whole words
 * only. A Restriction reads "no X" or "don't use X, Y" while a conflicting item says "X", so a Restriction
 * is reduced to target phrases: leading avoid words, then lead-in verbs are removed and what is left is
 * split on "or", "and", "and/or" and commas. A sensitivity first loses its descriptive lead-in.
 */
final class PhraseMatcher {

	/** Avoid words after normalising ("don't" loses its apostrophe). "do", "should" and "must" count before "not". */
	private static final Set<String> AVOID_WORDS = Set.of("no", "not", "never", "avoid", "dont", "cant", "cannot",
			"shouldnt", "mustnt", "without", "stop", "please");

	private static final Set<String> AVOID_BEFORE_NOT = Set.of("do", "should", "must");

	private static final Set<String> LEAD_IN_VERBS = Set.of("use", "using", "let", "allow", "give", "giving");

	/** Descriptive lead-ins of a sensitivity, as normalised words. */
	private static final List<List<String>> DESCRIPTIVE = List.of(List.of("dislike"), List.of("hate"),
			List.of("avoid"), List.of("sensitive", "to"), List.of("sensitivity", "to"), List.of("afraid", "of"),
			List.of("scared", "of"), List.of("allergic", "to"), List.of("intolerant", "of"));

	private static final String COMMA = ",";

	private PhraseMatcher() {
	}

	/** The normalised words of {@code text}. */
	static List<String> words(String text) {
		List<String> words = new ArrayList<>(tokens(text));
		words.removeIf(COMMA::equals);
		return words;
	}

	/** Words with a "," token wherever the text had a comma, semicolon or newline. */
	private static List<String> tokens(String text) {
		if (text == null) {
			return List.of();
		}
		StringBuilder sb = new StringBuilder(text.length());
		for (char c : text.toLowerCase(Locale.ROOT).toCharArray()) {
			if (c == '\'' || c == '’' || c == '‘' || c == '`') {
				continue;
			}
			if (c == ',' || c == ';' || c == '\n') {
				sb.append(" , ");
			}
			else {
				sb.append(Character.isLetterOrDigit(c) ? c : ' ');
			}
		}
		List<String> tokens = new ArrayList<>();
		for (String w : sb.toString().split(" ")) {
			if (!w.isEmpty()) {
				tokens.add(w.equals(COMMA) ? w : singular(w));
			}
		}
		return tokens;
	}

	/**
	 * The target phrases of a Restriction's text, or of a sensitivity's text. Never empty for a text with a
	 * word in it: when nothing is left after removing lead-ins the whole normalised text is the target.
	 */
	static List<List<String>> targets(String text, boolean sensitivity) {
		List<String> all = tokens(text);
		int start = 0;
		if (sensitivity) {
			start = skipDescriptive(all, start);
		}
		start = skipAvoidWords(all, start);
		while (start < all.size() && LEAD_IN_VERBS.contains(all.get(start))) {
			start++;
		}
		List<List<String>> phrases = new ArrayList<>();
		List<String> current = new ArrayList<>();
		for (String t : all.subList(start, all.size())) {
			if (t.equals(COMMA) || t.equals("or") || t.equals("and")) {
				if (!current.isEmpty()) {
					phrases.add(List.copyOf(current));
					current.clear();
				}
			}
			else {
				current.add(t);
			}
		}
		if (!current.isEmpty()) {
			phrases.add(List.copyOf(current));
		}
		if (phrases.isEmpty()) {
			List<String> whole = words(text);
			return whole.isEmpty() ? List.of() : List.of(List.copyOf(whole));
		}
		return phrases;
	}

	private static int skipDescriptive(List<String> all, int start) {
		boolean moved = true;
		while (moved) {
			moved = false;
			for (List<String> lead : DESCRIPTIVE) {
				if (startsWith(all, start, lead)) {
					start += lead.size();
					moved = true;
					break;
				}
			}
		}
		return start;
	}

	private static int skipAvoidWords(List<String> all, int start) {
		while (start < all.size()) {
			String w = all.get(start);
			if (AVOID_WORDS.contains(w)) {
				start++;
			}
			else if (AVOID_BEFORE_NOT.contains(w) && start + 1 < all.size() && all.get(start + 1).equals("not")) {
				start += 2;
			}
			else {
				break;
			}
		}
		return start;
	}

	private static boolean startsWith(List<String> all, int start, List<String> lead) {
		return start + lead.size() <= all.size() && all.subList(start, start + lead.size()).equals(lead);
	}

	/** Whether {@code phrase} appears in {@code words} as consecutive whole words. An empty phrase never matches. */
	static boolean contains(List<String> words, List<String> phrase) {
		if (phrase.isEmpty() || phrase.size() > words.size()) {
			return false;
		}
		for (int i = 0; i + phrase.size() <= words.size(); i++) {
			if (words.subList(i, i + phrase.size()).equals(phrase)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Drops a plural ending so singular and plural agree: "textures"/"texture", "boxes"/"box",
	 * "stories"/"story", "cookies"/"cookie" (words ending in "ie" or "ies" take the "y" stem).
	 */
	static String singular(String w) {
		int n = w.length();
		if (n >= 4 && w.endsWith("ies")) {
			return w.substring(0, n - 3) + "y";
		}
		if (n >= 3 && w.endsWith("ie")) {
			return w.substring(0, n - 2) + "y";
		}
		if (n > 4 && w.endsWith("es") && (w.endsWith("sses") || w.endsWith("xes") || w.endsWith("zes")
				|| w.endsWith("ches") || w.endsWith("shes"))) {
			return w.substring(0, n - 2);
		}
		if (n > 3 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is")) {
			return w.substring(0, n - 1);
		}
		return w;
	}

}
