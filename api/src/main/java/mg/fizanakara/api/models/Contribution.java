package mg.fizanakara.api.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import mg.fizanakara.api.models.Person;  // ← FIX : Import Person (remplace Members)
import mg.fizanakara.api.models.enums.ContributionStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;

@Entity
@Table(name = "contributions", indexes = {
        @Index(name = "idx_contributions_member_year", columnList = "member_id, year"),
        @Index(name = "idx_contributions_status", columnList = "status"),
        @Index(name = "idx_contributions_child", columnList = "child_id")
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class Contribution {

    @Id
    private String id;  // "COT2026-001" (unique)

    @Column(nullable = false)
    @NotNull(message = "Year is required")
    private Year year;

    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Status is required")
    @Builder.Default
    private ContributionStatus status = ContributionStatus.PENDING;

    @Column(nullable = false)
    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)  // FK vers persons.id
    @NotNull(message = "Person is required")  // ← FIX : Message pour Person
    @JsonIgnore
    private Person member;  // ← FIX : Typé Person (générique, remplace Members)

    @Column(name = "child_id", nullable = true)
    private String childId;  // Optionnel pour mineurs

    @Column(name = "sequence_suffix", nullable = true)
    private String sequenceSuffix;

    public String generatedCustomId() {
        if (this.getYear() == null || this.getSequenceSuffix() == null) {
            throw new IllegalStateException("Year and sequenceSuffix must be set before generating ID");
        }
        return "COT" + this.getYear() + "-" + this.getSequenceSuffix();
    }

    public boolean isChildContribution() {
        return this.getChildId() != null && !this.getChildId().isEmpty();
    }
}