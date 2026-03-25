package mg.fizanakara.api.repository;

import mg.fizanakara.api.models.Admins;
import mg.fizanakara.api.models.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByToken(String token);
    
    @Modifying
    @Transactional
    void deleteByToken(String token);

    @Modifying
    @Transactional
    void deleteByAdmin(Admins admin);

    Optional<PasswordResetToken> findByAdmin(Admins admin);
}