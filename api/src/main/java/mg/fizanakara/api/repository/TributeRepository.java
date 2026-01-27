package mg.fizanakara.api.repository;

import mg.fizanakara.api.models.Tribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TributeRepository extends JpaRepository<Tribute, Long> {
    Optional<Tribute> findByName(String name);
    boolean existsByName(String name);
}