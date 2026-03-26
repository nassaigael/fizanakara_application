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
import mg.fizanakara.api.models.enums.MemberStatus;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "persons", indexes = {
        @Index(name = "idx_persons_parent_id", columnList = "parent_id"),
        @Index(name = "idx_persons_district_id", columnList = "district_id"),
        @Index(name = "idx_persons_tribute_id", columnList = "tribute_id")
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class Person extends Users {

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @NotNull(message = "Status is required")
    private MemberStatus status = MemberStatus.STUDENT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id", nullable = false)
    @NotNull(message = "District is required")
    @JsonIgnore
    private District district;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tribute_id", nullable = false)
    @NotNull(message = "Tribute is required")
    @JsonIgnore
    private Tribute tribute;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JsonIgnore
    private Person parent;

    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<Person> children = new ArrayList<>();

    @Column(name = "is_active_member", nullable = false)
    private boolean isActiveMember = false;

    @Override
    public String generatedCustomId() {
        return "MBR" + String.format("%08d", this.getSequenceNumber());
    }

    public boolean isEligibleForContribution(Year year) {
        int age = calculateAgeAtYear(this.getBirthDate(), year);
        return age >= 18;
    }

    public int calculateAgeAtYear(LocalDate birthDate, Year year) {
        LocalDate endOfYear = LocalDate.of(year.getValue(), 12, 31);
        return endOfYear.getYear() - birthDate.getYear() -
                (endOfYear.isBefore(birthDate.withDayOfYear(birthDate.getDayOfYear())) ? 1 : 0);
    }

    public void setIsActiveMember(boolean isActiveMember) {
        this.isActiveMember = isActiveMember;
    }
}