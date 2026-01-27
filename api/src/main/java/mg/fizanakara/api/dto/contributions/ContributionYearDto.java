package mg.fizanakara.api.dto.contributions;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Year;

@Data
public class ContributionYearDto {
    @NotNull(message = "Year is required")
    private Year year;
}
