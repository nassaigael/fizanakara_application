package mg.fizanakara.api.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.fizanakara.api.dto.admins.AdminResponseDto;
import mg.fizanakara.api.dto.admins.LoginRequestDTO;
import mg.fizanakara.api.dto.admins.RegisterRequestDTO;
import mg.fizanakara.api.dto.admins.UpdateAdminDto;
import mg.fizanakara.api.exceptions.AdminsException;
import mg.fizanakara.api.models.Admins;
import mg.fizanakara.api.models.enums.Gender;
import mg.fizanakara.api.security.JwtUtil;
import mg.fizanakara.api.services.AdminsService;
import mg.fizanakara.api.services.PasswordResetService;
import mg.fizanakara.api.services.RefreshTokenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class AdminsAuthController {
    private final AuthenticationManager authenticationManager;
    private final AdminsService adminsService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetService passwordResetService;

    // REGISTER
    @PreAuthorize("hasRole('SUPERADMIN')")
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Validated RegisterRequestDTO req) throws AdminsException {
        Admins admin = Admins.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .birthDate(req.getBirthDate())
                .gender(Gender.valueOf(req.getGender().toUpperCase()))
                .imageUrl(req.getImageUrl())
                .phoneNumber(req.getPhoneNumber())
                .email(req.getEmail())
                .password(req.getPassword())
                .build();

        Admins saved = adminsService.register(admin);
        log.info("New admin saved: {}", saved.getEmail());
        return ResponseEntity.ok(new AdminResponseDto(saved));
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Validated LoginRequestDTO req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(auth);

            String accessToken = jwtUtil.generateAccessToken(req.getEmail());
            Admins admin = adminsService.findByEmail(req.getEmail())
                    .orElseThrow(() -> new AdminsException("Admin non trouvé après authentification"));

            var rt = refreshTokenService.createRefreshToken(admin);

            log.info("Login success for: {}", req.getEmail());
            return ResponseEntity.ok(Map.of(
                    "user", Map.of(
                            "id", admin.getId(),
                            "email", admin.getEmail(),
                            "firstname", admin.getFirstName(),
                            "lastname", admin.getLastName(),
                            "gender", admin.getGender()),
                    "role", admin.getRole(),
                    "accessToken", accessToken,
                    "refreshToken", rt.getToken()
            ));
        } catch (BadCredentialsException e) {
            log.warn("Login failed for {}: Invalid credentials", req.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Email or password incorrect", "success", false));
        } catch (Exception e) {
            log.error("Error logging in for {}: {}", req.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Failed authentication", "success", false));
        }
    }

    // DELETE ADMIN BY ID SUPERADMIN ONLY ACCESS
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> deleteAdmin(@PathVariable String id) {
        try {
            adminsService.deleteAdminById(id);
            log.info("Admin deletion request for ID: {}", id);
            return ResponseEntity.ok(Map.of("message", "Admin deleted successfully", "success", true));
        } catch (AdminsException e) {
            log.warn("Admin deletion failed for ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "success", false));
        }
    }

    // REFRESH TOKEN
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> body) {
        String token = body.get("refreshToken");
        if (token == null) return ResponseEntity.badRequest().body("Token requis");

        var stored = refreshTokenService.findByToken(token);
        if (stored.getExpiryDate().isBefore(java.time.Instant.now())) {
            refreshTokenService.deleteByToken(token);
            return ResponseEntity.status(401).body("Refresh token expired");
        }

        String accessToken = jwtUtil.generateAccessToken(stored.getAdmin().getEmail());
        log.debug("Refresh token success for: {}", stored.getAdmin().getEmail());
        return ResponseEntity.ok(Map.of("accessToken", accessToken));
    }

    // FORGOT PASSWORD
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        log.info("Password reset request for: {}", email);
        passwordResetService.createAndSendPasswordResetToken(email);
        return ResponseEntity.ok("Password reset email sent if the account exists.");
    }

    // RESET PASSWORD
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        passwordResetService.resetPassword(token, newPassword);
        log.info("Password reset successful for token: {}", token != null ? token.substring(0, Math.min(token.length(), 8)) + "..." : "null");
        return ResponseEntity.ok("Password reset successfully.");
    }

    // GET ME
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admins/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body("Unauthorized");
        String email = authentication.getName();
        Admins admin = adminsService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Profile not found for: " + email));
        log.debug("Profile retrieved for: {}", email);
        return ResponseEntity.ok(new AdminResponseDto(admin));
    }

    // GET ALL ADMINS
    @GetMapping("/admins/all")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<AdminResponseDto>> getAllAdmins() throws AdminsException {
        log.info("Request to retrieve all admins");
        return ResponseEntity.ok(adminsService.getAllAdmins());
    }

    // UPDATE ME
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admins/me")
    public ResponseEntity<?> updateMe(@RequestBody @Validated UpdateAdminDto req, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated", "success", false));
        }
        String email = authentication.getName();
        try {
            AdminResponseDto updated = adminsService.updateAdmin(email, req);
            log.info("Profile update successful for: {}", email);
            return ResponseEntity.ok(Map.of(
                    "message", "Profile updated successfully",
                    "success", true,
                    "user", updated
            ));
        } catch (AdminsException e) {
            log.warn("Profile update failed for {}: {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage(), "success", false));
        } catch (Exception e) {
            log.error("Error updating profile for {}: {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update profile", "success", false));
        }
    }
}