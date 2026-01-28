package mg.fizanakara.api.dto.tributes;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TributeDto {
    @NotBlank
    private String name;
}
