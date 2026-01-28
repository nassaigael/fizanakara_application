package mg.fizanakara.api.dto.admins;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequestDTO {
    @NotBlank
    private String firstName;
    @NotBlank private String lastName;
    @NotNull
    private java.time.LocalDate birthDate;
    @NotBlank private String gender;
    @NotBlank private String imageUrl;
    @NotBlank private String phoneNumber;
    @NotBlank @Email
    private String email;
    @NotBlank private String password;
}
