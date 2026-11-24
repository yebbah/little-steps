package app.littlesteps.careteam.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CareTeamMemberRepository extends JpaRepository<CareTeamMember, UUID> {

	List<CareTeamMember> findAllByOrderByCreatedAtAscIdAsc();

}
