package app.littlesteps.careteam.domain;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import app.littlesteps.careteam.persistence.CareTeamMember;
import app.littlesteps.careteam.persistence.CareTeamMemberRepository;
import app.littlesteps.careteam.persistence.MemberPromptLevel;
import app.littlesteps.careteam.persistence.MemberPromptLevelRepository;
import app.littlesteps.careteam.persistence.PromptLevel;
import app.littlesteps.careteam.persistence.PromptLevelRepository;
import app.littlesteps.careteam.persistence.StatusVocabularyItem;
import app.littlesteps.careteam.persistence.StatusVocabularyItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Read side of the Care Team and the Family's Prompt Levels. The tenant filter limits every read to the current Family. */
@Service
public class CareTeamService {

	/** A member with their Status Vocabulary and Prompt Level mapping, both in order and including retired items. */
	public record Member(CareTeamMember member, List<StatusVocabularyItem> statusVocabulary,
			List<MemberPromptLevel> promptLevelMapping) {
	}

	private final CareTeamMemberRepository members;

	private final PromptLevelRepository promptLevels;

	private final StatusVocabularyItemRepository vocabulary;

	private final MemberPromptLevelRepository mappings;

	CareTeamService(CareTeamMemberRepository members, PromptLevelRepository promptLevels,
			StatusVocabularyItemRepository vocabulary, MemberPromptLevelRepository mappings) {
		this.members = members;
		this.promptLevels = promptLevels;
		this.vocabulary = vocabulary;
		this.mappings = mappings;
	}

	@Transactional(readOnly = true)
	public List<Member> listMembers() {
		Map<UUID, List<StatusVocabularyItem>> words = vocabulary.findAllByOrderByCareTeamMemberIdAscOrdinalAscIdAsc()
			.stream()
			.collect(Collectors.groupingBy(StatusVocabularyItem::getCareTeamMemberId));
		Map<UUID, List<MemberPromptLevel>> maps = mappings.findAllByOrderByCareTeamMemberIdAscPromptLevelIdAsc()
			.stream()
			.collect(Collectors.groupingBy(MemberPromptLevel::getCareTeamMemberId));
		return members.findAllByOrderByCreatedAtAscIdAsc()
			.stream()
			.map(m -> new Member(m, words.getOrDefault(m.getId(), List.of()), maps.getOrDefault(m.getId(), List.of())))
			.toList();
	}

	@Transactional(readOnly = true)
	public List<PromptLevel> listPromptLevels() {
		return promptLevels.findAllByOrderByOrdinalAscIdAsc();
	}

}
