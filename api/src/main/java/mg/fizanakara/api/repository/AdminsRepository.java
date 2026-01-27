package mg.fizanakara.api.repository;

import mg.fizanakara.api.models.Admins;
import mg.fizanakara.api.models.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface AdminsRepository extends JpaRepository<Admins, String> {
    boolean existsByEmail(String email);
    Optional<Admins> findByEmail(String email);
    Collection<Object> findByRole(Role role);

    @Query("SELECT COUNT(a) FROM Admins a WHERE a.role = 'SUPERADMIN'")
    long countBySuperAdminRole();

    Optional<Admins> findByIdAndRole(String id, Role role);
}
