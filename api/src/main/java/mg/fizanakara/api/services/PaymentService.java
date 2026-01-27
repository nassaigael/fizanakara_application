package mg.fizanakara.api.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.fizanakara.api.dto.payments.PaymentDto;
import mg.fizanakara.api.dto.payments.PaymentResponseDto;
import mg.fizanakara.api.exceptions.ContributionNotFoundException;
import mg.fizanakara.api.exceptions.PaymentNotFoundException;
import mg.fizanakara.api.models.Contribution;
import mg.fizanakara.api.models.Payment;
import mg.fizanakara.api.models.enums.PaymentStatus;
import mg.fizanakara.api.repository.ContributionRepository;
import mg.fizanakara.api.repository.PaymentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final ContributionRepository contributionRepository;
    private final ContributionService contributionService;

    // GET BY CONTRIBUTION ID
    @Transactional(readOnly = true)
    public List<PaymentResponseDto> getPaymentsByContributionId(String contributionId) {
        log.info("Retrieving payments for contribution ID: {}", contributionId);
        return paymentRepository.findByContributionId(contributionId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // CREATE
    @Transactional
    public PaymentResponseDto createPayment(PaymentDto dto) {
        log.info("Creating payment for contribution ID: {} amount: {}", dto.getContributionId(), dto.getAmountPaid());

        Contribution contribution = contributionRepository.findById(dto.getContributionId())
                .orElseThrow(() -> new ContributionNotFoundException("Contribution not found with ID: " + dto.getContributionId()));

        BigDecimal currentTotalPaid = paymentRepository.getTotalPaidByContributionId(dto.getContributionId());
        if (currentTotalPaid == null) currentTotalPaid = BigDecimal.ZERO;
        BigDecimal projectedTotal = currentTotalPaid.add(dto.getAmountPaid());

        if (projectedTotal.compareTo(contribution.getAmount()) > 0) {
            BigDecimal surplus = projectedTotal.subtract(contribution.getAmount());
            log.warn("Overpayment blocked for contribution {}: projected total {} > amount {} (surplus: {})",
                    dto.getContributionId(), projectedTotal, contribution.getAmount(), surplus);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Map.of(
                    "error", "Overpaid detected",
                    "message", String.format("Amount total project (%s) overwrought the contribution (%s). excess : %s AR",
                            projectedTotal, contribution.getAmount(), surplus),
                    "contributionId", dto.getContributionId(),
                    "amountPaid", dto.getAmountPaid()
            ).toString());
        }

        Payment payment = Payment.builder()
                .amountPaid(dto.getAmountPaid())
                .paymentDate(dto.getPaymentDate() != null ? dto.getPaymentDate() : LocalDateTime.now())
                .status(dto.getStatus() != null ? dto.getStatus() : PaymentStatus.COMPLETED)
                .contribution(contribution)
                .build();

        payment.setId(payment.generatedCustomId());

        Payment saved = paymentRepository.save(payment);

        contributionService.updateContributionStatusAfterPayment(dto.getContributionId());

        return mapToResponseDto(saved);
    }

    // UPDATE
    @Transactional
    public PaymentResponseDto updatePayment(String id, PaymentDto dto) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with ID: " + id));

        if (dto.getAmountPaid() != null) payment.setAmountPaid(dto.getAmountPaid());
        if (dto.getPaymentDate() != null) payment.setPaymentDate(dto.getPaymentDate());
        if (dto.getStatus() != null) payment.setStatus(dto.getStatus());

        log.info("Updating payment ID: {}", id);

        Payment updated = paymentRepository.save(payment);

        contributionService.updateContributionStatusAfterPayment(updated.getContribution().getId());

        return mapToResponseDto(updated);
    }

    // DELETE
    @Transactional
    public void deletePayment(String id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with ID: " + id));
        log.info("Deleting payment ID: {}", id);
        paymentRepository.delete(payment);

        contributionService.updateContributionStatusAfterPayment(payment.getContribution().getId());
    }

    // DTO
    private PaymentResponseDto mapToResponseDto(Payment payment) {
        PaymentResponseDto dto = new PaymentResponseDto();
        dto.setId(payment.getId());
        dto.setAmountPaid(payment.getAmountPaid());
        dto.setPaymentDate(LocalDate.from(payment.getPaymentDate()));
        dto.setStatus(payment.getStatus());
        dto.setContributionId(payment.getContribution().getId());
        return dto;
    }
}