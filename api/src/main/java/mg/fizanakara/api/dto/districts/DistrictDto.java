package mg.fizanakara.api.dto.districts;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DistrictDto {
    @NotBlank
    private String name;
}
