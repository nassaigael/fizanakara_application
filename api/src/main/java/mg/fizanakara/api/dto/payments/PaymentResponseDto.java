package mg.fizanakara.api.dto.payments;

import lombok.Data;
import mg.fizanakara.api.models.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentResponseDto {
    private String id;
    private BigDecimal amountPaid;
    private LocalDate paymentDate;
    private PaymentStatus status;
    private String contributionId;
}
