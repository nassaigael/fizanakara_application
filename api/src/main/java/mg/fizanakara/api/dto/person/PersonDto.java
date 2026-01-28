package mg.fizanakara.api.dto.person;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import mg.fizanakara.api.models.enums.Gender;
import mg.fizanakara.api.models.enums.MemberStatus;

import java.time.LocalDate;

@Data
public class PersonDto {  // Input unifié (create/update)
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotNull(message = "Birth date is required")
    private LocalDate birthDate;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotNull(message = "Status is required")
    private MemberStatus status;

    @NotNull(message = "District ID is required")
    private Long districtId;

    @NotNull(message = "Tribute ID is required")
    private Long tributeId;

    private String parentId;  // ← AJOUT : Optionnel pour lien "fils de"
}