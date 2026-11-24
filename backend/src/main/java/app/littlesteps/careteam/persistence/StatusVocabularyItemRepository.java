package app.littlesteps.careteam.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusVocabularyItemRepository extends JpaRepository<StatusVocabularyItem, UUID> {

	List<StatusVocabularyItem> findAllByOrderByCareTeamMemberIdAscOrdinalAscIdAsc();

}
