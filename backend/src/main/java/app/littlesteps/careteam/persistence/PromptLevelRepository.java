package app.littlesteps.careteam.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PromptLevelRepository extends JpaRepository<PromptLevel, UUID> {

	List<PromptLevel> findAllByOrderByOrdinalAscIdAsc();

}
