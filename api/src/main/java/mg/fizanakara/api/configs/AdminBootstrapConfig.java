package mg.fizanakara.api.configs;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.fizanakara.api.models.Admins;
import mg.fizanakara.api.models.enums.Gender;
import mg.fizanakara.api.models.enums.Role;
import mg.fizanakara.api.repository.AdminsRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrapConfig {

    private final AdminsRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initSuperAdmin() {
        return args -> {
            if (adminRepository.findByRole(Role.SUPERADMIN).isEmpty()) {
                Admins superAdmin = Admins.builder()
                        .id("ADM00000001")
                        .firstName("Super")
                        .lastName("Admin")
                        .birthDate(LocalDate.of(1990, 1, 1))
                        .gender(Gender.MALE)
                        .imageUrl("gaelAdmin.jpeg")
                        .phoneNumber("+261389682194")
                        .email("fizanakara.super.adm@gmail.com")
                        .password(passwordEncoder.encode("SuperAdminPassword!"))
                        .role(Role.SUPERADMIN)
                        .sequenceNumber(1L)
                        .verified(true)
                        .build();

                adminRepository.save(superAdmin);
                log.info("SuperAdmin initial créé : {}", superAdmin.getEmail());
            } else {
                log.info("SuperAdmin exist déjà – bootstrap sauté.");
            }
        };
    }
}