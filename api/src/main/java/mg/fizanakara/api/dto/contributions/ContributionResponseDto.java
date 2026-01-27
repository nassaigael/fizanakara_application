package mg.fizanakara.api.dto.contributions;

import lombok.Data;
import mg.fizanakara.api.dto.payments.PaymentResponseDto;
import mg.fizanakara.api.models.enums.ContributionStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;

@Data
public class ContributionResponseDto {
    private String id;
    private Year year;
    private BigDecimal amount;
    private ContributionStatus status;
    private LocalDate dueDate;
    private BigDecimal totalPaid;
    private BigDecimal remaining;
    private String memberId;
    private String memberName;
    private String childId;
    private List<PaymentResponseDto> payments;
}