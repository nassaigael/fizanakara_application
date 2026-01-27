package mg.fizanakara.api.repository;

import mg.fizanakara.api.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByContributionId(String contributionId);
    @Query(value = "SELECT SUM(p.amount_paid) FROM payments p WHERE p.contribution_id = :contributionId", nativeQuery = true)
    BigDecimal getTotalPaidByContributionId(@Param("contributionId") String contributionId);
}
