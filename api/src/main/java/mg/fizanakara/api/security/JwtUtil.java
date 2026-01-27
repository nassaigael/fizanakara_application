package mg.fizanakara.api.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Slf4j
public class JwtUtil {
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long accessTokenExpirationMs;

    @Value("${jwt.refresh-expiration}")
    private long refreshTokenExpirationMs;

    public String generateAccessToken(String subject) {
        try {
            Date now = new Date();
            Date expiry = new Date(now.getTime() + accessTokenExpirationMs);
            return Jwts.builder()
                    .subject(subject)   // ✅ Changé : setSubject -> subject
                    .issuedAt(now)      // ✅ Changé : setIssuedAt -> issuedAt
                    .expiration(expiry) // ✅ Changé : setExpiration -> expiration
                    .signWith(getSigningKey(), Jwts.SIG.HS512)
                    .compact();
        } catch (Exception e) {
            log.error("Échec génération access token pour {}", subject, e);
            throw new RuntimeException("Échec lors de la génération de token", e);
        }
    }

    public String generateAccessToken(UserDetails userDetails) {
        try {
            Date now = new Date();
            Date expiry = new Date(now.getTime() + accessTokenExpirationMs);
            Map<String, Object> claims = new HashMap<>();
            claims.put("roles", userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList()));

            return Jwts.builder()
                    .claims(claims)     // ✅ Changé : setClaims -> claims
                    .subject(userDetails.getUsername())
                    .issuedAt(now)
                    .expiration(expiry)
                    .signWith(getSigningKey(), Jwts.SIG.HS512)
                    .compact();
        } catch (Exception e) {
            log.error("Échec génération access token pour {}", userDetails.getUsername(), e);
            throw new RuntimeException("Échec lors de la génération de token", e);
        }
    }

    public String generateRefreshToken(String subject) {
        try {
            Date now = new Date();
            Date expiry = new Date(now.getTime() + refreshTokenExpirationMs);
            return Jwts.builder()
                    .subject(subject)
                    .issuedAt(now)
                    .expiration(expiry)
                    .signWith(getSigningKey(), Jwts.SIG.HS512)
                    .compact();
        } catch (Exception e) {
            log.error("Échec génération refresh token pour {}", subject, e);
            throw new RuntimeException("Échec de la génération refresh token", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("Token invalide : {}", ex.getMessage());
            return false;
        }
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String getSubject(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (JwtException ex) {
            log.warn("Erreur extraction subject du token : {}", ex.getMessage());
            return null;
        }
    }

    @SuppressWarnings("unchecked") // ✅ AJOUT : Pour supprimer l'alerte de cast
    public List<String> getRoles(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            Object roles = claims.get("roles");
            return roles instanceof List ? (List<String>) roles : List.of();
        } catch (JwtException ex) {
            return List.of();
        }
    }
}