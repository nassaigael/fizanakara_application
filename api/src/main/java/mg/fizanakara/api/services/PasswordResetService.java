package mg.fizanakara.api.services;

import jakarta.transaction.Transactional;
import mg.fizanakara.api.exceptions.UserNotFoundException;
import mg.fizanakara.api.models.Admins;
import mg.fizanakara.api.models.PasswordResetToken;
import mg.fizanakara.api.repository.AdminsRepository;
import mg.fizanakara.api.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private final PasswordResetTokenRepository tokenRepo;
    private final AdminsRepository adminsRepository;
    private final JavaMailSender emailSender;
    private final PasswordEncoder passwordEncoder;

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);


    @Value("${app.token.expiration.minutes:30}")
    private long tokenExpirationMinutes;

    @Value("${app.client.reset.url:http://localhost:3000/reset-password}")
    private String clientResetUrl;

    private final String emailSubject = "Réinitialisation de mot de passe - Fizanakara";

    private final String emailBodyTemplate = """
            Bonjour,
            Clique sur le lien suivant pour réinitialiser ton mot de passe (valide %d minutes) :
            %s
            Si tu n'as pas demandé ce mail, ignore-le.
            Cordialement,
            L'équipe Fizanakara.""";

    @Transactional
    public void createAndSendPasswordResetToken(String email) {
        Admins admin = adminsRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Tentative of authentification with password  not existent : {}", email);
                    return new UserNotFoundException("mail not found");
                });

        Optional<PasswordResetToken> existingTokenOpt = tokenRepo.findByAdmin(admin);
        if (existingTokenOpt.isPresent()) {
            PasswordResetToken existingToken = existingTokenOpt.get();
            tokenRepo.delete(existingToken);
            tokenRepo.flush();
            log.debug("old token of reset deleted of admin : {}", admin.getEmail());
        } else {
            log.debug("no old token found for admin : {}", admin.getEmail());
        }

        String token = UUID.randomUUID().toString();
        Instant expiry = Instant.now().plus(tokenExpirationMinutes, ChronoUnit.MINUTES);
        PasswordResetToken prt = PasswordResetToken.builder()
                .token(token)
                .admin(admin)
                .expiryDate(expiry)
                .build();
        tokenRepo.save(prt);

        log.info("Token of reinitialisation of password created for admin : {}", admin.getEmail());

        String resetLink = clientResetUrl + "?token=" + token;
        String emailBody = String.format(emailBodyTemplate, tokenExpirationMinutes, resetLink);

        String toAddress = admin.getFirstName() + " " + admin.getLastName() + " <" + admin.getEmail() + ">";

        String fromAddress = "FIZANAKARA <ton-email@gmail.com>";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toAddress);
        message.setSubject(emailSubject);
        message.setText(emailBody);

        try {
            emailSender.send(message);
            log.info("mail of reinitialisation of password send to : {}", admin.getEmail());
        } catch (Exception e) {
            log.error("failure to send mail of reinitialisation to {} : {}", admin.getEmail(), e.getMessage(), e);
        }
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken prt = tokenRepo.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token invalid"));
        if (prt.getExpiryDate().isBefore(Instant.now())) {
            tokenRepo.deleteByToken(token);
            throw new RuntimeException("Token expiré");
        }

        Admins admin = prt.getAdmin();
        admin.setPassword(passwordEncoder.encode(newPassword));
        adminsRepository.save(admin);
        tokenRepo.deleteByToken(token);
    }
}