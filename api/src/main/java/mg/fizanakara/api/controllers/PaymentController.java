package mg.fizanakara.api.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.fizanakara.api.dto.payments.PaymentDto;
import mg.fizanakara.api.dto.payments.PaymentResponseDto;
import mg.fizanakara.api.services.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admins/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    private final PaymentService paymentService;

    // GET BY CONTRIBUTION ID
    @GetMapping("/contribution/{contributionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<PaymentResponseDto>> getPaymentsByContributionId(@PathVariable String contributionId) {
        log.debug("Retrieving payments for contribution ID: {}", contributionId);
        return ResponseEntity.ok(paymentService.getPaymentsByContributionId(contributionId));
    }

    // CREATE
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<PaymentResponseDto> createPayment(@RequestBody @Validated PaymentDto dto) {
        log.info("Creating payment for contribution ID: {} amount: {}", dto.getContributionId(), dto.getAmountPaid());
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createPayment(dto));
    }

    // UPDATE
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<PaymentResponseDto> updatePayment(@PathVariable String id, @RequestBody PaymentDto dto) {
        log.info("Updating payment ID: {}", id);
        return ResponseEntity.ok(paymentService.updatePayment(id, dto));
    }

    // DELETE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Void> deletePayment(@PathVariable String id) {
        log.info("Deleting payment ID: {}", id);
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}
