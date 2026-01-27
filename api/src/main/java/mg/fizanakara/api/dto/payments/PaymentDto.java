package mg.fizanakara.api.dto.payments;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import mg.fizanakara.api.models.enums.PaymentStatus;

@Data
public class PaymentDto {
    @NotNull(message = "Amount paid is required")
    private BigDecimal amountPaid;

    private LocalDateTime paymentDate = LocalDateTime.now();

    private PaymentStatus status = PaymentStatus.COMPLETED;

    @NotNull(message = "Contribution ID is required")
    private String contributionId;
}