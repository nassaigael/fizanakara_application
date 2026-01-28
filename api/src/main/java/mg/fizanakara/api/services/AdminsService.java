package mg.fizanakara.api.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.fizanakara.api.dto.admins.AdminResponseDto;
import mg.fizanakara.api.dto.admins.UpdateAdminDto;
import mg.fizanakara.api.exceptions.AdminsException;
import mg.fizanakara.api.models.Admins;
import mg.fizanakara.api.models.enums.Gender;
import mg.fizanakara.api.models.enums.Role;
import mg.fizanakara.api.repository.AdminsRepository;
import mg.fizanakara.api.repository.PasswordResetTokenRepository;
import mg.fizanakara.api.repository.RefreshTokenRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminsService {
    private final AdminsRepository adminsRepository;
    private final PasswordEncoder passwordEncoder;
    private final SequenceService sequenceService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    // REGISTER
    public Admins register(Admins admin) throws AdminsException {
        if (adminsRepository.existsByEmail(admin.getEmail()))
            throw new AdminsException("Email Already Exists");
        Long nextSeq = sequenceService.getNextSequence("admin_seq");
        admin.setSequenceNumber(nextSeq);
        admin.setId(admin.generatedCustomId());
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        admin.setCreatedAt(LocalDate.now());
        return adminsRepository.save(admin);
    }

    public boolean login(String email, String rawPassword) {
        return adminsRepository.findByEmail(email)
                .map(admins -> passwordEncoder.matches(rawPassword, admins.getPassword()))
                .orElse(false);
    }

    public Optional<Admins> findByEmail(String email) {
        return adminsRepository.findByEmail(email);
    }

    public Admins save(Admins admin) {
        return adminsRepository.save(admin);
    }

    // DELETE SECURED
    @Transactional
    public void deleteAdmins(Admins admin) {
        refreshTokenRepository.deleteByAdmin(admin);
        passwordResetTokenRepository.deleteByAdmin(admin);
        adminsRepository.delete(admin);
        log.info("Admin supprimé : {}. Les membres sont conservés.", admin.getId());
    }

    // FIND ADMIN BY ID
    public Optional<Admins> findById(String id) {
        return adminsRepository.findById(id);
    }

    //CREATE ADMIN
    public Admins createAdmins(Admins admins) {
        return adminsRepository.save(admins);
    }

    // UPDATE ADMIN
    @Transactional
    public AdminResponseDto updateAdmin(String email, UpdateAdminDto req) throws AdminsException {
        Admins admin = findByEmail(email)
                .orElseThrow(() -> new AdminsException("Admin not found with email : " + email));
        if (req.getEmail() != null && !req.getEmail().equals(admin.getEmail()) && adminsRepository.existsByEmail(req.getEmail()))
            throw new AdminsException("Email has exit use by other admin");

        int changes = 0;
        if (req.getFirstName() != null) { admin.setFirstName(req.getFirstName()); changes++; }
        if (req.getLastName() != null) { admin.setLastName(req.getLastName()); changes++; }
        if (req.getBirthDate() != null) { admin.setBirthDate(req.getBirthDate()); changes++; }
        if (req.getGender() != null) {
            try {
                admin.setGender(Gender.valueOf(req.getGender().toUpperCase()));
                changes++;
            } catch (IllegalArgumentException e) {
                throw new AdminsException("Gender invalid : " + req.getGender());
            }
        }
        if (req.getImageUrl() != null) { admin.setImageUrl(req.getImageUrl()); changes++; }
        if (req.getPhoneNumber() != null) { admin.setPhoneNumber(req.getPhoneNumber()); changes++; }
        if (req.getEmail() != null) { admin.setEmail(req.getEmail()); changes++; }
        if (req.getPassword() != null) { admin.setPassword(passwordEncoder.encode(req.getPassword())); changes++; }
        if (req.getVerified() != null) { admin.setVerified(req.getVerified()); changes++; }

        Admins updated = adminsRepository.save(admin);
        log.info("Admin {} mis à jour", email);
        return new AdminResponseDto(updated);
    }

    // DELETE ADMIN BY ID
    @Transactional
    public void deleteAdminById(String id) throws AdminsException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AdminsException("Unauthorized: No authenticated user");
        }
        String currentEmail = auth.getName();
        Admins currentAdmin = adminsRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new AdminsException("Current admin not found"));

        if (currentAdmin.getRole() != Role.SUPERADMIN) {
            throw new AdminsException("Only SuperAdmin can delete admins");
        }

        Admins targetAdmin = adminsRepository.findById(id)
                .orElseThrow(() -> new AdminsException("Admin not found with ID: " + id));

        if (currentAdmin.getId().equals(targetAdmin.getId())) {
            throw new AdminsException("SuperAdmin cannot delete themselves");
        }

        long superAdminCount = adminsRepository.countBySuperAdminRole();
        if (targetAdmin.getRole() == Role.SUPERADMIN && superAdminCount <= 1) {
            throw new AdminsException("Cannot delete the last SuperAdmin");
        }

        refreshTokenRepository.deleteByAdmin(targetAdmin);
        passwordResetTokenRepository.deleteByAdmin(targetAdmin);

        adminsRepository.delete(targetAdmin);
        log.info("Admin {} deleted by SuperAdmin {}", targetAdmin.getId(), currentAdmin.getId());
    }

    @Transactional(readOnly = true)
    public List<AdminResponseDto> getAllAdmins() throws AdminsException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AdminsException("Unauthorized: No authenticated user");
        }
        String currentEmail = auth.getName();
        Admins currentAdmin = adminsRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new AdminsException("Current admin not found"));
        if (currentAdmin.getRole() != Role.SUPERADMIN) {
            throw new AdminsException("Only SuperAdmin can view all admins");
        }

        List<Admins> allAdmins = adminsRepository.findAll();
        log.info("Retrieved {} admins for SuperAdmin {}", allAdmins.size(), currentEmail);

        return allAdmins.stream()
                .map(this::mapToAdminResponseDto)
                .collect(Collectors.toList());
    }

    // Helper mapping vers DTO
    private AdminResponseDto mapToAdminResponseDto(Admins admin) {
        AdminResponseDto dto = new AdminResponseDto();
        dto.setId(admin.getId());
        dto.setFirstName(admin.getFirstName());
        dto.setLastName(admin.getLastName());
        dto.setEmail(admin.getEmail());
        dto.setRole(admin.getRole());
        dto.setVerified(admin.isVerified());
        dto.setCreatedAt(admin.getCreatedAt());
        dto.setPhoneNumber(admin.getPhoneNumber());
        return dto;
    }
}