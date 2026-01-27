package mg.fizanakara.api.dto.admins;

import lombok.AllArgsConstructor;
import lombok.Data;
import mg.fizanakara.api.models.Admins;
import mg.fizanakara.api.models.enums.Role;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class AdminResponseDto {
    private String id;
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private String gender;
    private String imageUrl;
    private String phoneNumber;
    private String email;
    private Role role;
    private boolean verified;
    private LocalDate createdAt;

    public AdminResponseDto(Admins admin) {
        this.id = admin.getId();
        this.firstName = admin.getFirstName();
        this.lastName = admin.getLastName();
        this.birthDate = admin.getBirthDate();
        this.gender = admin.getGender() != null ? admin.getGender().toString() : null;
        this.imageUrl = admin.getImageUrl();
        this.phoneNumber = admin.getPhoneNumber();
        this.email = admin.getEmail();
        this.verified = admin.isVerified();
        this.createdAt = admin.getCreatedAt();
    }

    public AdminResponseDto() {

    }
}