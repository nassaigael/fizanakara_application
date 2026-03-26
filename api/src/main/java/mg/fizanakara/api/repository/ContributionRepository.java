package mg.fizanakara.api.repository;

import mg.fizanakara.api.models.Contribution;
import mg.fizanakara.api.models.enums.ContributionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Year;
import java.util.List;

@Repository
public interface ContributionRepository extends JpaRepository<Contribution, String> {

    List<Contribution> findByMemberIdAndYear(String memberId, Year year);

    List<Contribution> findByStatus(ContributionStatus status);

    // Cotisations par personne
    List<Contribution> findByMemberId(String memberId);

    @Query("SELECT c FROM Contribution c WHERE c.childId = :childId")
    List<Contribution> findByChildId(@Param("childId") String childId);

    @Query("SELECT COUNT(c) > 0 FROM Contribution c WHERE c.member.id = :memberId AND c.year = :year AND (:childId IS NULL OR c.childId = :childId)")
    boolean hasDuplicateByMemberAndYear(@Param("memberId") String memberId, @Param("year") Year year,
            @Param("childId") String childId);

    // Cotisations en retard
    @Query("SELECT c FROM Contribution c WHERE c.dueDate < CURRENT_DATE AND c.status != 'PAID'")
    List<Contribution> findOverdueContributions();
}