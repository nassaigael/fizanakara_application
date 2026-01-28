package mg.fizanakara.api.repository;

import mg.fizanakara.api.models.Person;
import mg.fizanakara.api.models.enums.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Optional;

@Repository
public interface PersonRepository extends JpaRepository<Person, String> {

    // Queries dérivées (comme avant pour phone/nom)
    Optional<Person> findByPhoneNumber(String phoneNumber);
    boolean existsByPhoneNumber(String phoneNumber);
    List<Person> findByFirstNameAndLastName(String firstName, String lastName);

    // Duplicate check (unifié pour Person ; cross avec vue si besoin, mais simplifié ici)
    @Query("SELECT COUNT(p) > 0 FROM Person p WHERE p.firstName = :firstName AND p.lastName = :lastName AND p.birthDate = :birthDate AND p.phoneNumber = :phoneNumber AND p.district.id = :districtId AND p.tribute.id = :tributeId AND p.status = :status AND (:currentId IS NULL OR p.id != :currentId)")
    boolean hasDuplicateByKeyFields(@Param("firstName") String firstName,
                                    @Param("lastName") String lastName,
                                    @Param("birthDate") LocalDate birthDate,
                                    @Param("phoneNumber") String phoneNumber,
                                    @Param("districtId") Long districtId,
                                    @Param("tributeId") Long tributeId,
                                    @Param("status") MemberStatus status,
                                    @Param("currentId") String currentId);

    // Éligibles pour cotisations (>=18 ans, fusion Members/Children)
    @Query("SELECT p FROM Person p WHERE :yearValue - YEAR(p.birthDate) >= 18 OR (:yearValue = YEAR(p.birthDate) AND MONTH(p.birthDate) < 12 AND DAY(p.birthDate) <= 31)")
    List<Person> findEligiblePersonsForContribution(@Param("yearValue") int yearValue);

    // Filters (fusionnés)
    @Query("SELECT p FROM Person p WHERE p.district.id = :districtId")
    List<Person> findByDistrictId(@Param("districtId") Long districtId);

    @Query("SELECT p FROM Person p WHERE p.tribute.id = :tributeId")
    List<Person> findByTributeId(@Param("tributeId") Long tributeId);

    List<Person> findByStatus(MemberStatus status);

    // Nouvelles queries pour hiérarchie (self-reference)
    List<Person> findByParentId(String parentId);  // Enfants directs d'un parent

    // Arbre familial récursif (native pour PostgreSQL)
    @Query(value = "WITH RECURSIVE family_tree AS (" +
            "  SELECT id, parent_id, first_name, last_name, birth_date, status, is_active_member FROM persons WHERE id = :rootId " +
            "  UNION ALL " +
            "  SELECT p.id, p.parent_id, p.first_name, p.last_name, p.birth_date, p.status, p.is_active_member FROM persons p " +
            "  INNER JOIN family_tree ft ON p.parent_id = ft.id " +
            ") SELECT id, parent_id, first_name, last_name, birth_date, status, is_active_member FROM family_tree", nativeQuery = true)
    List<Object[]> getFamilyTree(@Param("rootId") String rootId);  // Array pour mapping custom
}