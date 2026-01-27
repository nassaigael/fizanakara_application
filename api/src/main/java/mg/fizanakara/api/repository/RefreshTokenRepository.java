package mg.fizanakara.api.repository;

import mg.fizanakara.api.models.Admins;
import mg.fizanakara.api.models.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    Optional<RefreshToken> findByToken(String token);
    
    @Modifying
    @Transactional
    void deleteByToken(String token);

    @Modifying 
    @Transactional
    void deleteByAdmin(Admins admin);
}