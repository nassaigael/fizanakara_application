package mg.fizanakara.api.dto.admins;

import jakarta.validation.constraints.Email;
import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateAdminDto {
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private String gender;

    private String imageUrl;
    private String phoneNumber;

    @Email(message = "Email invalid")
    private String email;

    private String password;

    private Boolean verified;
}