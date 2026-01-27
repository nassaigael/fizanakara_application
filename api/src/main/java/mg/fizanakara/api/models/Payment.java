package mg.fizanakara.api.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mg.fizanakara.api.models.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_payments_contribution", columnList = "contribution_id"),
        @Index(name = "idx_payments_date", columnList = "payment_date")
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Payment {

    @Id
    private String id;

    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Amount paid is required")
    private BigDecimal amountPaid;

    @Column(nullable = false)
    @NotNull(message = "Payment date is required")
    @Builder.Default
    private LocalDateTime paymentDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column
    @Builder.Default
    private PaymentStatus status = PaymentStatus.COMPLETED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contribution_id", nullable = false)
    @NotNull(message = "Contribution is required")
    private Contribution contribution;
    
    public String generatedCustomId() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        return "PAY" + this.getPaymentDate().format(formatter);
    }
}