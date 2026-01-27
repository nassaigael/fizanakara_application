package mg.fizanakara.api.services;

import mg.fizanakara.api.models.Admins;
import mg.fizanakara.api.models.RefreshToken;
import mg.fizanakara.api.repository.AdminsRepository;
import mg.fizanakara.api.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenService {
    private RefreshTokenRepository refreshTokenRepository;
    private AdminsRepository adminsRepository;
    private final long refreshTokenDurationMs;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            AdminsRepository adminsRepository,
            @Value("${jwt.refresh-expiration}") long refreshTokenDurationMs) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.adminsRepository = adminsRepository;
        this.refreshTokenDurationMs = refreshTokenDurationMs;
    }

    public RefreshToken createRefreshToken(Admins admin) {
        String token = UUID.randomUUID().toString();
        Instant expiry = Instant.now().plusMillis(refreshTokenDurationMs);

        RefreshToken r = RefreshToken.builder()
                .token(token)
                .admin(admin)
                .expiryDate(expiry)
                .build();
        return refreshTokenRepository.save(r);
    }

    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));
    }

    public void deleteByToken(String token) {
        refreshTokenRepository.deleteByToken(token);
    }
}

