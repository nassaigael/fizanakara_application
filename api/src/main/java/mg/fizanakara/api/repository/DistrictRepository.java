package mg.fizanakara.api.repository;

import mg.fizanakara.api.models.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DistrictRepository extends JpaRepository<District, Long> {
    Optional<District> findByName(String name);
    boolean existsByName(String name);
}