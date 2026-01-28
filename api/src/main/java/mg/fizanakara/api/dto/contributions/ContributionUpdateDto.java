package mg.fizanakara.api.dto.contributions;

import lombok.Data;
import mg.fizanakara.api.models.enums.ContributionStatus;

import java.math.BigDecimal;

@Data
public class ContributionUpdateDto {
    private BigDecimal amount;
    private ContributionStatus status;
    private String memberId;
}
