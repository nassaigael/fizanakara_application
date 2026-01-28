package mg.fizanakara.api.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.fizanakara.api.dto.contributions.ContributionResponseDto;
import mg.fizanakara.api.dto.contributions.ContributionUpdateDto;
import mg.fizanakara.api.dto.contributions.ContributionYearDto;
import mg.fizanakara.api.dto.payments.PaymentResponseDto;
import mg.fizanakara.api.exceptions.ContributionNotFoundException;
import mg.fizanakara.api.models.Contribution;
import mg.fizanakara.api.models.Person;
import mg.fizanakara.api.models.enums.ContributionStatus;
import mg.fizanakara.api.models.enums.MemberStatus;
import mg.fizanakara.api.repository.ContributionRepository;
import mg.fizanakara.api.repository.PersonRepository;
import mg.fizanakara.api.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContributionService {
    private final ContributionRepository contributionRepository;
    private final PaymentRepository paymentRepository;
    private final PersonRepository personRepository;

    private final AtomicInteger sequenceCounter = new AtomicInteger(1);

    // GET ALL
    @Transactional(readOnly = true)
    public List<ContributionResponseDto> getAllContributions() {
        log.info("Retrieving all contributions");
        return contributionRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // GET BY PERSON AND YEAR (utilise membreId standard)
    @Transactional(readOnly = true)
    public List<ContributionResponseDto> getContributionsByPersonAndYear(String personId, Year year) {
        log.info("Retrieving contributions for person ID: {} and year: {}", personId, year);
        return contributionRepository.findByMemberIdAndYear(personId, year).stream()  // ← FIX : Appel standard
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // BATCH CRÉATION ANNUELLE (unifié pour Persons)
    @Transactional
    public List<ContributionResponseDto> createContributionsForYear(ContributionYearDto dto) {
        Year year = dto.getYear();
        int yearValue = year.getValue();
        log.info("Generating annual contributions for year: {}", year);

        List<Person> eligiblePersons = personRepository.findEligiblePersonsForContribution(yearValue);

        List<ContributionResponseDto> created = new ArrayList<>();

        sequenceCounter.set(1);

        for (Person person : eligiblePersons) {
            String personId = person.getId();
            String childId = person.isActiveMember() ? null : personId;
            if (contributionRepository.hasDuplicateByMemberAndYear(personId, year, childId)) {
                log.warn("Contribution for person {} and year {} already exists – skipping", personId, year);
                continue;
            }
            BigDecimal amount = calculateAmountForUser(person, year);
            Contribution contribution = createSingleContribution(year, amount, ContributionStatus.PENDING, personId, childId);
            created.add(mapToResponseDto(contribution));
        }

        log.info("Generated {} new contributions for year: {}", created.size(), year);
        return created;
    }

    // SINGLE POUR PERSON
    @Transactional
    public ContributionResponseDto createSingleContributionForPerson(Year year, String personId) {
        if (contributionRepository.hasDuplicateByMemberAndYear(personId, year, null)) {
            throw new IllegalArgumentException("Contribution for this person and year already exists");
        }

        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Person ID: " + personId));

        BigDecimal amount = calculateAmountForUser(person, year);

        Contribution contribution = Contribution.builder()
                .year(year)
                .amount(amount)
                .status(ContributionStatus.PENDING)
                .dueDate(LocalDate.of(year.getValue(), 12, 31))
                .member(person)
                .childId(person.isEligibleForContribution(year) ? null : personId)
                .build();

        String suffix = String.format("%03d", sequenceCounter.getAndIncrement());
        contribution.setSequenceSuffix(suffix);
        contribution.setId(contribution.generatedCustomId());

        Contribution saved = contributionRepository.save(contribution);
        return mapToResponseDto(saved);
    }

    // UPDATE
    @Transactional
    public ContributionResponseDto updateContribution(String id, ContributionUpdateDto dto) {
        Contribution contribution = contributionRepository.findById(id)
                .orElseThrow(() -> new ContributionNotFoundException("Contribution not found with ID: " + id));

        if (dto.getAmount() != null) contribution.setAmount(dto.getAmount());
        if (dto.getStatus() != null) contribution.setStatus(dto.getStatus());
        if (dto.getMemberId() != null) {
            Person person = personRepository.findById(dto.getMemberId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid Person ID"));
            contribution.setMember(person);  // ← FIX : OK avec type Person
        }

        log.info("Updating contribution ID: {}", id);
        Contribution updated = contributionRepository.save(contribution);
        return mapToResponseDto(updated);
    }

    // DELETE
    @Transactional
    public void deleteContribution(String id) {
        Contribution contribution = contributionRepository.findById(id)
                .orElseThrow(() -> new ContributionNotFoundException("Contribution not found with ID: " + id));
        log.info("Deleting contribution ID: {}", id);
        contributionRepository.delete(contribution);
    }

    // UPDATE STATUS POST-PAIEMENT
    @Transactional
    public void updateContributionStatusAfterPayment(String contributionId) {
        Contribution contribution = contributionRepository.findById(contributionId)
                .orElseThrow(() -> new ContributionNotFoundException("Contribution not found with ID: " + contributionId));

        BigDecimal totalPaid = paymentRepository.getTotalPaidByContributionId(contributionId);
        if (totalPaid == null) totalPaid = BigDecimal.ZERO;

        log.info("Updating status for contribution ID: {} totalPaid: {} amount: {}", contributionId, totalPaid, contribution.getAmount());

        if (totalPaid.compareTo(contribution.getAmount()) >= 0) {
            contribution.setStatus(ContributionStatus.PAID);
        } else if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            contribution.setStatus(ContributionStatus.PARTIAL);
        } else if (LocalDate.now().isAfter(contribution.getDueDate())) {
            contribution.setStatus(ContributionStatus.OVERDUE);
        } else {
            contribution.setStatus(ContributionStatus.PENDING);
        }

        contributionRepository.save(contribution);
    }

    // MAPPING DTO
    private ContributionResponseDto mapToResponseDto(Contribution contribution) {
        ContributionResponseDto dto = new ContributionResponseDto();
        dto.setId(contribution.getId());
        dto.setYear(contribution.getYear());
        dto.setAmount(contribution.getAmount());
        dto.setStatus(contribution.getStatus());
        dto.setDueDate(contribution.getDueDate());
        dto.setMemberId(contribution.getMember().getId());
        dto.setMemberName(contribution.getMember().getFirstName() + " " + contribution.getMember().getLastName());

        if (contribution.getChildId() != null) {
            dto.setChildId(contribution.getChildId());
        }

        BigDecimal totalPaid = paymentRepository.getTotalPaidByContributionId(contribution.getId());
        dto.setTotalPaid(totalPaid != null ? totalPaid : BigDecimal.ZERO);
        dto.setRemaining(contribution.getAmount().subtract(dto.getTotalPaid()));

        dto.setPayments(paymentRepository.findByContributionId(contribution.getId()).stream()
                .map(payment -> {
                    PaymentResponseDto pDto = new PaymentResponseDto();
                    pDto.setId(payment.getId());
                    pDto.setAmountPaid(payment.getAmountPaid());
                    pDto.setPaymentDate(LocalDate.from(payment.getPaymentDate()));
                    pDto.setStatus(payment.getStatus());
                    pDto.setContributionId(payment.getContribution().getId());
                    return pDto;
                })
                .collect(Collectors.toList()));

        return dto;
    }

    // HELPER PRIVATE (adapté pour Person)
    private Contribution createSingleContribution(Year year, BigDecimal amount, ContributionStatus status, String personId, String childId) {
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Person ID: " + personId));

        Contribution contribution = Contribution.builder()
                .year(year)
                .amount(amount)
                .status(status)
                .dueDate(LocalDate.of(year.getValue(), 12, 31))
                .member(person)  // ← FIX : OK avec type Person
                .childId(childId)
                .build();

        String suffix = String.format("%03d", sequenceCounter.getAndIncrement());
        contribution.setSequenceSuffix(suffix);
        contribution.setId(contribution.generatedCustomId());

        return contributionRepository.save(contribution);
    }

    // CALCUL AMOUNT (adapté pour Person)
    private BigDecimal calculateAmountForUser(Person person, Year year) {
        int age = person.calculateAgeAtYear(person.getBirthDate(), year);
        MemberStatus status = person.getStatus();
        if (age >= 18 && age <= 21 && status == MemberStatus.STUDENT) {
            return BigDecimal.valueOf(30000);
        }
        return BigDecimal.valueOf(40000);
    }
}